import Links from './Links'
import Form from './Form'
import './App.css'
import { useState } from 'react';





function App() {
  const [token, setToken] = useState('')
  const [path, setPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoadLinks, setIsLoadLinks] = useState(false)

  async function setClipboard(text) {
    const type = "text/plain";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    await navigator.clipboard.write(data);
    setLoading(true)
  }

  const writeToBuffer = () => {
    const links = document.querySelectorAll('.link')
    let stringOfLinks = ''
    links.forEach(item => stringOfLinks += `${item.href}\n`)
    setClipboard(stringOfLinks)
  }

  const setTokenHandler = (e)  => {
    setToken(e.target.value)
  }

  const setPathHandler = (e) => {
    setPath(e.target.value)
  }

  return (
    <>
      <h1>Укажи токен и путь к папке с Яндекс диска</h1>
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
