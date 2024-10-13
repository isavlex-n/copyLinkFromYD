import { useState, useEffect, FC, Dispatch, SetStateAction } from 'react'
import { DataType } from './types'

type OwnProps = {
  token: string
  path: string
  setIsLoadLinks: Dispatch<SetStateAction<boolean>>
}

type Props = FC<OwnProps>

type File = {
  name: number
  public_url: undefined | string
  path: string
}

type Files = File[]

const Links: Props = ({ token, path, setIsLoadLinks }) => {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<Files>([])

  const fields = '_embedded.items'

  const limit = 1000

  const reqPath = `https://cloud-api.yandex.net/v1/disk/resources?path=${encodeURI(
    path,
  )}&fields=${fields}&limit=${limit}`


  async function getDataFromDisk(req: string) {
    try {
      const dataRes = await fetch(req, {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`,
        },
      })
      const data = await dataRes.json()
      const items: DataType[] = data._embedded.items
      const sortedData: Files = items.map(item => ({
        name: +item.name.split('.')[0],
        public_url: item.public_url,
        path: item.path
      })).sort((a, b) => a.name - b.name)
      setFiles([...sortedData])
      setIsLoadLinks(true)
    } catch (error) {
      setIsLoadLinks(false)
      console.error('Произошла ошибка!', error)
    }
  }

  async function publishFiles(files: Files) {
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
