import { useState } from 'preact/hooks';
import './Deploy.css'
import { envToReadable, envToReadableSmall, serverTypeConfig, serverTypes } from '../../util/server_consts';
import { Icon } from '../../util/icon';
import { deployContainer } from '../../util/docker';

interface Props {
  path: string;
}

export function Deploy(props: Props) {
  const [config, setConfig] = useState({})

  const deploy = async () => {
    showDialog('Deploying (this may take a moment)...')
    const res = await deployContainer(
      config['SERVER_NAME'],
      config['PORT'],
      config['TYPE'],
      config['VERSION'],
      // Filter out the previous values that are not needed, and convert bools and numbers to strings
      Object.fromEntries(Object.entries(config).filter(([k, v]) => {
        return k !== 'NAME' && k !== 'PORT' && k !== 'TYPE' && k !== 'VERSION'
      }).map(([k, v]) => {
        return [k, v.toString()]
      }))
    )

    console.log(res)

    // Close dialog, open server list
    window.dispatchEvent(new CustomEvent('close-dialog'))
    window.location.hash = '/manage'
  }

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
            }], setConfig, config)
          }
          {
            Object.entries(serverTypeConfig('ALL')).map(c => (
              optionToElement(c, setConfig, config)
            ))
          }
        </div>

        <div class="advanced-options">
          <h2>
            Advanced Options
          </h2>
          {
            Object.entries(serverTypeConfig('ALL_ADVANCED')).map(c => (
              optionToElement(c, setConfig, config)
            ))
          }
        </div>

        <div class="mod-options">
          <h2>
            Server-type Specific Options
          </h2>

          {
            Object.entries(serverTypeConfig(config['TYPE'] || 'VANILLA')).map(c => (
              optionToElement(c, setConfig, config)
            ))
          }
        </div>
      </div>

      <div class="deploy-button-outer" onClick={deploy}>
        <button class="deploy-button">
          DEPLOY
        </button>
      </div>
    </div>
  )
}

export function optionToElement(option: [string, any], setConfig: (config: any) => void, config: any = {}) {
  // If there is a default value, set it in the config
  if ('default' in option[1] && !(option[0] in config)) {
    setConfig((config) => {
      // Only change if it doesn't exist
      if (!(option[0] in config)) {
        config[option[0]] = option[1].default
        return { ...config }
      }

      return config
    })
  }

  const optionType = option[1].options ? 'select' : (
    typeof option[1].default === 'boolean' || typeof option[1].placeholder === 'boolean' ? 'checkbox' : (
      // Check if number, else text
      typeof option[1].default === 'number' || typeof option[1].placeholder === 'number' ? 'number' : 'text'
    )
  )

  if (option[1].show === false) {
    return null
  }

  return (
    <div class={`option ${optionType}`}>
      <div class="label">
        <label for={option[0]}>
          {envToReadable(option[0])}
        </label>

        {
          option[1]?.note && (
            <Icon icon="info_circle" onClick={() => {
              showDialog(option[1].note)
            }} />
          )
        }
      </div>
      {
        optionType === 'select' && (
          <select
            id={option[0]}
            onChange={(e) => {
              setConfig((config) => {
                // @ts-expect-error cry about it
                config[option[0]] = e.target.value
                return { ...config }
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
          <input
            checked={
              option[0] in config ? config[option[0]] : option[1].default || false
            }
            type="checkbox" id={option[0]} 
            onChange={() => {
              setConfig((config) => {
                config[option[0]] = !config[option[0]]
                return { ...config }
              })
            }}
          />
        )
      }

      {
        // May have a "size" field, which is either "large" or "small"
        optionType === 'text' && (
          (option[1].size && option[1].size === 'large') ? (
            <input
              value={config[option[0]] || option[1].default || ''}
              type="textarea" id={option[0]}
              placeholder={option[1]?.placeholder || ''}
              onInput={(e) => {
                setConfig((config) => {
                  // @ts-expect-error cry about it
                  config[option[0]] = e.target.value
                  return { ...config }
                })
              }}
            />
          ) : (
            <input
              value={config[option[0]] || option[1].default || ''}
              type="text" id={option[0]}
              placeholder={option[1]?.placeholder || ''}
              onInput={(e) => {
                setConfig((config) => {
                  // @ts-expect-error cry about it
                  config[option[0]] = e.target.value
                  return { ...config }
                })
              }}
            />
          )
        )
      }

      {
        optionType === 'number' && (
          <input
            value={config[option[0]] || option[1].default || ''}
            type="number" id={option[0]}
            placeholder={option[1]?.placeholder || ''}
            onInput={(e) => {
              setConfig((config) => {
                // @ts-expect-error cry about it
                config[option[0]] = e.target.value
                return { ...config }
              })
            }}
          />
        )
      }
    </div>
  )
}

function showDialog(msg: string) {
  const event = new CustomEvent('open-dialog', {
    detail: {
      kind: 'general',
      data: msg
    }
  })

  window.dispatchEvent(event)
}