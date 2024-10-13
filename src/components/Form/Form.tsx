import { FC, ChangeEvent } from 'react'

type OwnProps = {
  token: string
  path: string
  setToken: (e: ChangeEvent<HTMLInputElement>) => void
  setPath: (e: ChangeEvent<HTMLInputElement>) => void
}

type Props = FC<OwnProps>

const Form: Props = ({ token, setToken, path, setPath }) => {
  return (
    <form>
      <div>
        <input
          type="text"
          placeholder="Yandex token"
          value={token}
          onChange={setToken}
        />
      </div>

      <div>
        <input type="text" placeholder="Path" value={path} onChange={setPath} />
      </div>
    </form>
  )
}

export default Form
