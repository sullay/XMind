
const XLSX = require('xlsx')

export function jsonToExcel (jsonArray) {
  const workbook = XLSX.utils.book_new()
  Object.keys(jsonArray).forEach(function (key) {
    const worksheet = XLSX.utils.json_to_sheet(jsonArray[key].map(item => {
      const temp = {}
      for (const k in item) {
        temp[k] = String(item[k])
      }
      return temp
    }))
    XLSX.utils.book_append_sheet(workbook, worksheet, key)
  })
  const wopts = { bookType: 'csv', bookSST: false, type: 'array' }
  const wbout = XLSX.write(workbook, wopts)
  return wbout
}
