import { useState, ChangeEvent } from 'react';
import Links from './components/Link/Links'
import Form from './components/Form/Form'
import './App.css'

function App() {
  const [token, setToken] = useState('')
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoadLinks, setIsLoadLinks] = useState(false)

  async function setClipboard(text: string) {
    const type = "text/plain";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    await navigator.clipboard.write(data);
    setLoading(true)
  }

  const writeToBuffer = () => {
    const links = document.querySelectorAll<HTMLLinkElement>('.link') 
    let stringOfLinks = ''
    links.forEach(item => stringOfLinks += `${item.href}\n`)
    setClipboard(stringOfLinks)
  }

  const setTokenHandler = (e: ChangeEvent<HTMLInputElement>)  => {
    setToken(e.target.value)
  }

  const setPathHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPath(e.target.value)
  }

  return (
    <>
      <h1>Укажи токен и путь к папке с Яндекс диска</h1>
      <p>Файлы на диске, должны быть именованны цифрами</p>
      <Form
        token={token}
        setToken={setTokenHandler}
        path={path}
        setPath={setPathHandler}
      />
      <Links
        token={token}
        path={path}
        setIsLoadLinks={setIsLoadLinks}
      />
      {isLoadLinks && (<button onClick={writeToBuffer} className={loading ? 'green-bg' : ''}>Копировать ссылки</button>)}
    </>
  )
}

export default App
