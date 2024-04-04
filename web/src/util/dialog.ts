export function openDialog(kind: 'general' | 'config' | 'delete', data: unknown) {
  window.dispatchEvent(new CustomEvent('open-dialog', {
    detail: {
      kind,
      data
    }
  }))
}

export function closeDialog() {
  window.dispatchEvent(new CustomEvent('close-dialog'))
}

