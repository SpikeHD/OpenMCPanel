import { useState } from 'preact/hooks';
import './Deploy.css'
import { envToReadable, envToReadableSmall, serverTypeConfig, serverTypes } from '../../util/server_consts';

interface Props {
  path: string;
}

export function Deploy(props: Props) {
  const [config, setConfig] = useState({})

  return (
    <div class="deploy">
      <h1>Deploy</h1>
      
      <div class="deploy-form">
        <div class="base-options">
          <h2>
            Basic Options
          </h2>

          {
            optionToElement(['TYPE', {
              default: 'VANILLA',
              placeholder: 'VANILLA',
              options: serverTypes()
            }], setConfig)
          }
          {
            Object.entries(serverTypeConfig('ALL')).map(c => (
              optionToElement(c, setConfig)
            ))
          }
        </div>

        <div class="advanced-options">
          <h2>
            Advanced Options
          </h2>
          {
            Object.entries(serverTypeConfig('ALL_ADVANCED')).map(c => (
              optionToElement(c, setConfig)
            ))
          }
        </div>

        <div class="mod-options">
          <h2>
            Server-type Specific Options
          </h2>

          {
            Object.entries(serverTypeConfig(config['TYPE'] || 'VANILLA')).map(c => (
              optionToElement(c, setConfig)
            ))
          }
        </div>
      </div>
    </div>
  )
}

export function optionToElement(option: [string, any], setConfig: (config: any) => void) {
  // If there is a default value, set it in the config
  if (option[1].default) {
    setConfig((config) => {
      config[option[0]] = option[1].default
      return config
    })
  }

  const optionType = option[1].options ? 'select' : (
    typeof option[1].default === 'boolean' || typeof option[1].placeholder === 'boolean' ? 'checkbox' : (
      // Check if number, else text
      typeof option[1].default === 'number' || typeof option[1].placeholder === 'number' ? 'number' : 'text'
    )
  )

  return (
    <div class={`option ${optionType}`}>
      <label for={option[0]}>{envToReadable(option[0])}</label>
      {
        optionType === 'select' && (
          <select value={option[1].default || ''} id={option[0]} onChange={(e) => {
            setConfig((config) => {
              // @ts-expect-error cry about it
              config[option[0]] = e.target.value
              return config
            })
          }}>
            {
              option[1].options.map(o => (
                <option value={o as string}>{envToReadableSmall(o as string)}</option>
              ))
            }
          </select>
        )
      }

      {
        optionType === 'checkbox' && (
          <input value={option[1].default || ''} type="checkbox" id={option[0]} onChange={(e) => {
            setConfig((config) => {
              // @ts-expect-error cry about it
              config[option[0]] = e.target.checked
              return config
            })
          }} />
        )
      }

      {
        // May have a "size" field, which is either "large" or "small"
        optionType === 'text' && (
          (option[1].size && option[1].size === 'large') ? (
            <input value={option[1].default || ''} type="textarea" id={option[0]} placeholder={option[1]?.placeholder || ''} />
          ) : (
            <input value={option[1].default || ''} type="text" id={option[0]} placeholder={option[1]?.placeholder || ''}/>
          )
        )
      }

      {
        optionType === 'number' && (
          <input value={option[1].default || ''} type="number" id={option[0]} placeholder={option[1]?.placeholder || ''}/>
        )
      }
    </div>
  )
}