import { useState, useEffect } from "react"

function Links({token, path, setIsLoadLinks}) {

  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])

  // const token = 'y0_AgAAAABxXFfqAADLWwAAAAETwHveAAC3kh1YH6pAupmnGhkxBuQdsd41jQ'

  // const path = 'Serts'

  const fields = '_embedded.items'

  const limit = 1000

  const reqPath = `https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURI(
    path,
  )}&fields=${fields}&limit${limit}`

  async function getDataFromDisk(req) {
    try {
      setLoading(true)
      const dataRes = await fetch(req, {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`,
        },
      })
      const data = await dataRes.json()
      setFiles([...data._embedded.items])
      setLoading(false)
      setIsLoadLinks(true)
    } catch (error) {
      setIsLoadLinks(false)
      console.error('Произошла ошибка!', error)
    }
  }

  useEffect(() => {
    if (!token || !path) return;
    getDataFromDisk(reqPath)
  }, [token, path])
  return (
    <ul>{loading ? (<p>Нет ссылок</p>) : files.map((item, i) => (
      <li key={i}><a href={item.file} className="link">{item.name}</a></li>
    ))}
      
    </ul>
  )
}

export default Links
