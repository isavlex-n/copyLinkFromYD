import React, { useState } from "react";

async function getFilesInFolder(folderPath, oauthToken) {
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
  return items.filter((item) => item.type === "file"); // Фильтруем только файлы
}

// Функция для публикации файла и получения публичной ссылки
async function publishFile(filePath, oauthToken) {
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
const App = () => {
  const [token, setToken] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [publicLinks, setPublicLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPublicLinks([]);

    try {
      let files = await getFilesInFolder(folderPath, token);
      let links = [];
      setTotal(files.length);
      for (let file of files) {
        if (file.public_url) continue;
        await publishFile(file.path, token);
        setCount((prevCount) => prevCount + 1);
      }
      files = await getFilesInFolder(folderPath, token);
      links = files
        .map((item: any) => ({
          name: +item.name.split(".")[0],
          link: item.public_url,
          path: item.path,
        }))
        .sort((a, b) => a.name - b.name);
      setPublicLinks(links);
    } catch (err) {
      setError("Произошла ошибка: " + err.message);
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
