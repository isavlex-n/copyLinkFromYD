function Form({token, setToken, path, setPath}) {
  return (
    <form>
      <div><input type="text" placeholder="Yandex token" value={token} onChange={setToken}/></div>
      
      <div><input type="text" placeholder="Path" value={path} onChange={setPath} /></div>
    </form>
  )
}

export default Form