import { JSX } from 'preact/jsx-runtime'

interface ServerConfig {
  [key: string]: {
    [key: string]: {
      default: string | number | boolean;
      placeholder?: string | number | boolean;
      // Extra info for user
      note?: string | JSX.Element;
      // If specified, this will be a select list
      options?: string[];
      // Hidden options
      show?: boolean;
      // Size (for things like textfields,whether they should be large or small)
      size?: 'large' | 'small';
    }
  }
}

// Remove underscores and captialize the whole word
export function envToReadable(env: string) {
  return env.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Remove underscores and only make first letter uppercase
export function envToReadableSmall(env: string) {
  return env.replace(/_/g, ' ')
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase())
    .join(' ')
}

export function serverTypes() {
  // Ignore JVM, ALL, ALL_ADVANCED
  return Object.keys(serverConfigs).filter(e => !['JVM', 'ALL', 'ALL_ADVANCED', 'NOT_VANILLA'].includes(e))
}

export function serverTypeConfig(serverType: string) {
  return serverConfigs[serverType]
}

export const serverConfigs: ServerConfig = {
  ALL: {
    SERVER_NAME: {
      default: 'Minecraft Server',
      placeholder: 'Minecraft Server',
      note: 'Primarily for identifying the container, but also for things like BungeeCord.'
    },
    PORT: {
      default: 25565,
      placeholder: 25565
    },
    VERSION: {
      default: '',
      placeholder: 'latest'
    },
    MAX_PLAYERS: {
      default: 20,
      placeholder: 20
    },
    MOTD: {
      default: '',
      placeholder: 'A Minecraft Server'
    },
    DIFFICULTY: {
      default: 'easy',
      placeholder: 'easy',
      options: ['peaceful', 'easy', 'normal', 'hard']
    },
    MODE: {
      default: 'survival',
      placeholder: 'survival',
      options: ['survival', 'creative', 'adventure', 'spectator']
    },
    SEED: {
      default: '',
      placeholder: ''
    },
    WHITELIST: {
      default: '',
      placeholder: '',
      note: 'Comma separated list of usernames. Will disable whitelist if empty.',
      size: 'large'
    },
    OPS: {
      default: '',
      placeholder: '',
      note: 'Comma separated list of usernames',
      size: 'large'
    },
    ICON: {
      default: '',
      placeholder: 'https://...'
    },
  },
  ALL_ADVANCED: {
    CUSTOM_IMAGE: {
      // This is not an env var, but something sent with the deploy request which shoould pull and use the specific image
      default: '',
      placeholder: 'username/repo:tag',
      note: 'Use a custom image instead of the default one (itzg/minecraft-server)'
    },
    CUSTOM_IMAGE_TAG: {
      default: '',
      placeholder: 'latest',
      note: 'use a specific tag. if a custom image is specified, this will be used as the tag for the official image.'
    },
    CUSTOM_SERVER: {
      default: '',
      placeholder: 'https://...',
      note: 'Doesn\'t support local/uploaded files... yet.'
    },
    ENABLE_QUERY: {
      default: false,
      placeholder: false,
      note: 'Enable GameSpy query protocol'
    },
    MAX_WORLD_SIZE: {
      default: '',
      placeholder: '',
      note: 'Possible size in blocks, as radius'
    },
    MAX_BUILD_HEIGHT: {
      default: '',
      placeholder: '',
      note: 'Maximum height in blocks'
    },
    ALLOW_NETHER: {
      default: true,
      placeholder: true
    },
    ANNOUNCE_PLAYER_ACHIEVEMENTS: {
      default: true,
      placeholder: true
    },
    ENABLE_COMMAND_BLOCK: {
      default: false,
      placeholder: false
    },
    FORCE_GAMEMODE: {
      default: false,
      placeholder: false
    },
    GENERATE_STRUCTURES: {
      default: true,
      placeholder: true
    },
    HARDCORE: {
      default: false,
      placeholder: false
    },
    MAX_TICK_TIME: {
      default: '',
      placeholder: '',
      note: 'Maximum single player tick time'
    },
    SPAWN_ANIMALS: {
      default: true,
      placeholder: true
    },
    SPAWN_MONSTERS: {
      default: true,
      placeholder: true
    },
    SPAWN_NPCS: {
      default: true,
      placeholder: true
    },
    SPAWN_PROTECTION: {
      default: '',
      placeholder: '',
      note: 'Spawn protection radius, in blocks as radius. 0 for none.'
    },
    VIEW_DISTANCE: {
      default: '',
      placeholder: '',
      note: 'View distance in chunks'
    },
    PVP: {
      default: true,
      placeholder: true
    },
    LEVEL_TYPE: {
      default: 'default',
      placeholder: 'default',
      options: ['default', 'flat', 'largeBiomes', 'amplified', 'customized']
    },
    GENERATOR_SETTINGS: {
      default: '',
      placeholder: '',
      note: 'For customized level type. JSON format.',
      size: 'large'
    },
    RESOURCE_PACK: {
      default: '',
      placeholder: 'https://...'
    },
    RESOURCE_PACK_SHA1: {
      default: '',
      placeholder: 'a12b34c56d78e90f12a34b56c78d90e12f34a56b78c90d12e34f56a78b90c12d34e56f78',
      note: 'SHA1 hash of the resource pack.'
    },
    RESOURCE_PACK_ENFORCE: {
      default: false,
      placeholder: false
    },
    LEVEL: {
      default: '',
      placeholder: '',
      note: 'World name. Unless you plan on switching between worlds, you can leave this blank.'
    },
    ONLINE_MODE: {
      default: true,
      placeholder: true
    },
    ALLOW_FLIGHT: {
      default: false,
      placeholder: false
    },
    CUSTOM_SERVER_PROPERTIES: {
      default: '',
      placeholder: 'key=value',
      note: 'Custom server.properties settings',
      size: 'large'
    },
  },
  JVM: {
    MEMORY: {
      default: '1G',
      placeholder: '1G',
      note: 'Amount of memory to allocate to the JVM. Use G for gigabytes, M for megabytes, etc.'
    },
    INIT_MEMORY: {
      default: '1G',
      placeholder: '1G',
      note: 'Initial memory allocation pool'
    },
    MAX_MEMORY: {
      default: '1G',
      placeholder: '1G',
      note: 'Maximum memory allocation pool'
    },
    JVM_OPTS: {
      default: '',
      placeholder: '-Xmx1G -Xms1G',
      note: 'Additional JVM options'
    },
  },
  NOT_VANILLA: {
    PLUGINS: {
      default: '',
      placeholder: 'https://...,https://...',
      note: 'Links to plugins'
    },
    MODS: {
      default: '',
      placeholder: 'https://...,https://...',
      note: 'Links to mods'
    },
    // CurseForge vars
    CURSEFORGE_FILES: {
      default: '',
      placeholder: 'jei,238222,https://www.curseforge.com/minecraft/mc-mods/jei/files/4593548',
      note: (
        <>Comma-seperated list of CurseForge resources. More info: <a href='https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/curseforge/'>https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/curseforge/</a></>
      )
    },
    CF_API_KEY: {
      default: '',
      placeholder: 'ab12cd34ef56gh78ij90kl',
      note: 'CurseForge API key. Required for downloading from CurseForge.'
    },
    // Modrinth vars
    MODRINTH_PROJECTS: {
      default: '',
      placeholder: 'ferrite-core,lithium:mc1.20.4-0.12.1,simple-voice-chat:beta',
      note: (
        <>Comma-seperated list of Modrinth resources. More info: <a href='https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/modrinth/'>https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/modrinth/</a></>
      )
    },
    MODRINTH_DOWNLOAD_DEPENDENCIES: {
      default: 'NONE',
      options: ['NONE', 'REQUIRED', 'OPTIONAL'],
      note: 'Download dependencies for Modrinth mods.'
    },
    MODRINTH_ALLOWED_VERSION_TYPE: {
      default: 'release',
      options: ['release', 'alpha', 'beta'],
      note: 'Allowed version types for Modrinth mods.'
    },
    PACKWIZ_URL: {
      default: '',
      placeholder: 'https://...',
      note: (
        <>PackWiz URL. More info: <a href='https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/packwiz/'>https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/packwiz/</a></>
      )
    }
  },
  VANILLA: {},
  SPIGOT: {
    SPIGOT_DOWNLOAD_URL: {
      default: '',
      placeholder: 'https://...'
    },
    SPIGET_RESOURCES: {
      default: '',
      placeholder: '12345',
      note: (
        <>Comma-seperated list of Spiget resource IDs. More info: <a href='https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/spiget/'>https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/spiget/</a></>
      )
    }
  },
  BUKKIT: {
    BUKKIT_DOWNLOAD_URL: {
      default: '',
      placeholder: 'https://...'
    },
    SPIGET_RESOURCES: {
      default: '',
      placeholder: '12345',
      note: (
        <>Comma-seperated list of Spiget resource IDs. More info: <a href='https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/spiget/'>https://docker-minecraft-server.readthedocs.io/en/latest/mods-and-plugins/spiget/</a></>
      )
    }
  },
  CANYON: {
    VERSION: {
      default: '',
      placeholder: 'b1.7.3',
      note: 'Canyon only supports beta 1.7.3',
      show: false,
    },
    CANYON_BUILD: {
      default: '',
      placeholder: 'latest'
    },
    DISABLE_HEALTHCHECK: {
      default: true,
      placeholder: true,
      note: 'Required for Canyon'
    },
  },
  FABRIC: {
    FABRIC_LAUNCHER_VERSION: {
      default: '',
      placeholder: 'latest'
    },
    FABRIC_LOADER_VERSION: {
      default: '',
      placeholder: 'latest'
    },
  },
  FORGE: {
    FORGE_VERSION: {
      default: '',
      placeholder: 'latest'
    },
  },
  NEOFORGE: {
    NEOFORGE_VERSION: {
      default: '',
      placeholder: 'latest'
    },
  },
  MAGMA_MAINTAINED: {
    FORGE_VERSION: {
      default: '',
      placeholder: ''
    },
    MAGMA_MAINTAINED_TAG: {
      default: '',
      placeholder: 'latest'
    },
  },
  KETTING: {
    KETTING_VERSION: {
      default: '',
      placeholder: 'latest',
      note: (
        <>More info: <a href='https://docker-minecraft-server.readthedocs.io/en/latest/types-and-platforms/server-types/hybrids/#ketting'>https://docker-minecraft-server.readthedocs.io/en/latest/types-and-platforms/server-types/hybrids/#ketting</a></>
      )
    },
    FORGE_VERSION: {
      default: '',
      placeholder: 'latest'
    },
  },
  MOHIST: {
    MOHIST_BUILD: {
      default: '',
      placeholder: 'latest'
    }
  },
  CATSERVER: {},
  SPONGEVANILLA: {
    SPONGE_VERSION: {
      default: '',
      placeholder: 'latest'
    },
    SPONGEBRANCH: {
      default: '',
      placeholder: 'stable'
    },
    // We need to change the image tag since Sponge requires Java 8
    CUSTOM_IMAGE_TAG: {
      default: 'java8-multiarch',
      show: false
    }
  },
  LIMBO: {
    LIMBO_BUILD: {
      default: '',
      placeholder: 'latest',
      note: (
        <>Find applicable versions here: <a href='https://ci.loohpjames.com/job/Limbo/'>https://ci.loohpjames.com/job/Limbo/</a></>
      )
    }
  },
  CRUCIBLE: {
    CRUCIBLE_RELEASE: {
      default: '',
      placeholder: 'latest',
    },
    VERSION: {
      // Only works on 1.7.10
      default: '1.7.10',
      show: false
    }
  },
  PAPER: {
    PAPERBUILD: {
      default: '',
      placeholder: 'latest'
    },
    PAPER_DOWNLOAD_URL: {
      default: '',
      placeholder: 'https://...'
    },
    SPIGET_RESOURCES: {
      default: '',
      placeholder: '12345',
      note: (
        <>More info: <a href='https://docker-minecraft-server.readthedocs.io/en/latest/types-and-platforms/server-types/hybrids/#ketting'>https://docker-minecraft-server.readthedocs.io/en/latest/types-and-platforms/server-types/hybrids/#ketting</a></>
      )
    }
  },
  PUFFERFISH: {
    PUFFERFISH_BUILD: {
      default: '',
      placeholder: 'lastSuccessfulBuild'
    }
  },
  PURPUR: {
    PURPUR_BUILD: {
      default: '',
      placeholder: 'latest'
    },
    PURPUR_DOWNLOAD_URL: {
      default: '',
      placeholder: 'https://...'
    }
  },
  FOLIA: {
    FOLIA_BUILD: {
      default: '',
      placeholder: 'latest'
    },
    FOLIA_DOWNLOAD_URL: {
      default: '',
      placeholder: 'https://...'
    }
  },
  QUILT: {
    QUILT_LOADER_VERSION: {
      default: '',
      placeholder: 'latest'
    },
    QUILT_INSTALLER_VERSION: {
      default: '',
      placeholder: 'latest'
    },
    QUILT_LAUNCHER_URL: {
      default: '',
      placeholder: 'https://...'
    }
    // TODO missing QUILT_LAUNCHER
  }
}