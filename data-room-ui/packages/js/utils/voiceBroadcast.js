/**
 * @description 文字转语音方法
 * @public
 * @param { text, rate, lang, volume, pitch } object
 * @param  text 要合成的文字内容，字符串
 * @param  rate 读取文字的语速 0.1~10  正常1
 * @param  lang 读取文字时的语言
 * @param  volume  读取时声音的音量 0~1  正常1
 * @param  pitch  读取时声音的音高 0~2  正常1
 * @returns SpeechSynthesisUtterance
 */
export default function speak ({ text, speechRate, lang, volume, pitch }, endEvent, startEvent) {
  if (!window.SpeechSynthesisUtterance) {
    console.warn('当前浏览器不支持文字转语音服务')
    return
  }

  if (!text) {
    return
  }

  const speechUtterance = new SpeechSynthesisUtterance()
  speechUtterance.text = text
  speechUtterance.rate = speechRate || 1
  speechUtterance.lang = lang || 'zh-CN'
  speechUtterance.volume = volume || 1
  speechUtterance.pitch = pitch || 1
  speechUtterance.onend = function () {
    endEvent && endEvent()
  }
  speechUtterance.onstart = function () {
    startEvent && startEvent()
  }
  speechSynthesis.speak(speechUtterance)
}
