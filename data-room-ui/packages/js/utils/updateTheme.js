export default function updateTheme (data) {
  const querySelectorName = data === false ? false : !data ? '.el-button--primary' : data
  if (querySelectorName) {
    window.requestAnimationFrame(() => {
      const primaryButton = document.querySelector(querySelectorName)
      if (primaryButton) {
        const backgroundColor = window.getComputedStyle(primaryButton).getPropertyValue('background-color')
        const element = document.querySelector('.bs-body-theme-wrap')
        element.style.setProperty('--bs-el-color-primary', backgroundColor)
      }
    })
  }
}
