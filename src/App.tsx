import React, { useState, FormEvent } from "react";

interface FileItem {
  type: string;
  path: string;
  public_url?: string;
  name: string;
}

interface PublicLink {
  name: number;
  link: string;
  path: string;
}

async function getFilesInFolder(
  folderPath: string,
  oauthToken: string,
): Promise<FileItem[]> {
  const response = await fetch(
    `https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURIComponent(
      folderPath,
    )}&fields=_embedded&limit=100000`,
    {
      method: "GET",
      headers: {
        Authorization: `OAuth ${oauthToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ошибка при получении файлов: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();
  const items = data._embedded.items;
  if (!items) {
    throw new Error(
      "Ответ от API не содержит файлов. Пожалуйста, проверьте путь к папке и токен.",
    );
  }
  return items.filter((item: FileItem) => item.type === "file"); // Фильтруем только файлы
}

// Функция для публикации файла и получения публичной ссылки
async function publishFile(
  filePath: string,
  oauthToken: string,
): Promise<string> {
  const response = await fetch(
    `https://cloud-api.yandex.net/v1/disk/resources/publish?path=${encodeURIComponent(
      filePath,
    )}`,
    {
      method: "PUT",
      headers: {
        Authorization: `OAuth ${oauthToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Ошибка при публикации файла: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();
  return data.href; // Возвращаем публичную ссылку
}

// Главный компонент
const App: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [folderPath, setFolderPath] = useState<string>("");
  const [publicLinks, setPublicLinks] = useState<PublicLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [count, setCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPublicLinks([]);
    setCount(0); // Сброс счетчика

    try {
      let files = await getFilesInFolder(folderPath, token);
      let links: PublicLink[] = [];
      setTotal(files.length);

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.public_url) continue;
        await publishFile(file.path, token);
        setCount((prevCount) => prevCount + 1);
      }
      files = await getFilesInFolder(folderPath, token);
      links = files
        .map((item) => ({
          name: +item.name.split(".")[0],
          link: item.public_url!,
          path: item.path,
        }))
        .sort((a, b) => a.name - b.name);
      const allNumbers = links.map((link) => link.name);
      const minNumber = Math.min(...allNumbers);
      const maxNumber = Math.max(...allNumbers);
      const fullRange = Array.from(
        { length: maxNumber - minNumber + 1 },
        (_, i) => minNumber + i,
      );
      const missingNumbers = fullRange.filter(
        (num) => !allNumbers.includes(num),
      );

      console.log(missingNumbers);
      setPublicLinks(links);
    } catch (err) {
      setError("Произошла ошибка: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    const text = publicLinks.map((link) => `${link.link}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      alert("Ссылки скопированы в буфер обмена!");
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Публикация файлов на Яндекс.Диске</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="token">OAuth Токен</label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label htmlFor="folderPath">Путь к папке на Диске</label>
          <input
            type="text"
            id="folderPath"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          {isLoading ? "Загружается..." : "Получить публичные ссылки"}
        </button>
        {isLoading && `${count} из ${total}`}
      </form>

      {error && <div style={{ color: "red", marginTop: "20px" }}>{error}</div>}

      {publicLinks.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Публичные ссылки на файлы:</h2>
          <ul>
            {publicLinks.map((link, index) => (
              <li key={index}>
                <a href={link.link} target="_blank" rel="noopener noreferrer">
                  {link.name}
                </a>{" "}
                - {link.link}
              </li>
            ))}
          </ul>
          <button
            onClick={handleCopyToClipboard}
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            Копировать ссылки в буфер обмена
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
