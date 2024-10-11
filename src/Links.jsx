import { useState, useEffect } from 'react'

function Links({ token, path, setIsLoadLinks }) {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])

  const fields = '_embedded.items'

  const limit = 1000

  const reqPath = `https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURI(
    path,
  )}&fields=${fields}&limit${limit}`


  async function getDataFromDisk(req) {
    try {
      const dataRes = await fetch(req, {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`,
        },
      })
      const data = await dataRes.json()
      setFiles([...data._embedded.items])
      setIsLoadLinks(true)
    } catch (error) {
      setIsLoadLinks(false)
      console.error('Произошла ошибка!', error)
    }
  }

  async function publishFiles(files) {
    try {
      setLoading(true)
      files.forEach(async (item) => {
        await fetch(
          `https://cloud-api.yandex.net/v1/disk/resources/publish?path=${encodeURI(
            item.path,
          )}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `OAuth ${token}`,
            },
          },
        )
      })
      getDataFromDisk(reqPath)
      setLoading(false)
    } catch (error) {
      setIsLoadLinks(false)
      console.error('Произошла ошибка!', error)
    }
  }

  useEffect(() => {
    if (!token || !path) return
    getDataFromDisk(reqPath)
  }, [token, path])

  useEffect(() => {
    if (!files.length) return;
    publishFiles(files)
  }, [files])
  return (
    <ul>
      {loading ? (
        <p>Нет ссылок</p>
      ) : (
        files.map((item, i) => (
          <li key={i}>
            <a href={item.public_url} className="link" target='_blank'>
              {item.name}
            </a>
          </li>
        ))
      )}
    </ul>
  )
}

export default Links
