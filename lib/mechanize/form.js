'use strict'
const { newButton } = require('./form/button')
const { newCheckbox } = require('./form/checkbox')
const { newField } = require('./form/field')
const { newFileUpload } = require('./form/file_upload')
const { newHidden } = require('./form/hidden')
const { newImageButton } = require('./form/image_button')
const { newMultiSelectList } = require('./form/multi_select_list')
const { newRadioButton } = require('./form/radio_button')
const { newReset } = require('./form/reset')
const { newSelectList } = require('./form/select_list')
const { newSubmit } = require('./form/submit')
const { newText } = require('./form/text')
const { newTextarea } = require('./form/textarea')
const { nodeAttr, search } = require('./utils.js')

const randomString = size =>
  'abcdefghjiklmnopqrstuvwxyz0123456789'.substr(0, size)

const urlencode = str => encodeURIComponent(str)
  .replace(/!/g, '%21')
  .replace(/'/g, '%27')
  .replace(/\(/g, '%28')
  .replace(/\)/g, '%29')
  .replace(/\*/g, '%2A')
  .replace(/%20/g, '+')

const buildQueryString = params => params
  .filter(param => param[0])
  .map(
    param => param.map(nameOrValue => urlencode(nameOrValue)).join('=')
  )
  .join('&')

const mimeValueQuote = name => name.replace(/(["\r\\])/g, s => '\\' + s)

const paramToMultipart = ({ name, value }) => 'Content-Disposition: form-data; ' +
        'name="' + mimeValueQuote(name) + '"\r\n' +
        '\r\n' + value + '\r\n'

// eslint-disable-next-line
  // TODO: implement
const fileToMultipart = fileUpload => fileUpload

const getEnctype = node => {
  const attr = nodeAttr(node, 'ecntype')
  if (attr === 'multipart/form-data' || attr === 'text/plain') {
    return attr
  }
  return 'application/x-www-form-urlencoded'
}
const getMethod = node => {
  const attr = nodeAttr(node, 'method')
  if (attr && attr.match(/^post$/i)) {
    return 'post'
  }
  return 'get'
}

const getBoolean = (node, name) => Boolean(nodeAttr(node, name))

const newForm = (page, node) => {
  const fields = []
  const form = {}
  const action = nodeAttr(node, 'action')
  const boundary = randomString(20)
  const enctype = getEnctype(node)
  const method = getMethod(node)
  const name = nodeAttr(node, 'name')
  const noValidate = getBoolean(node, 'novalidate')
  const target = nodeAttr(node, 'target')
  const clickedButtons = []
  const buttons = []
  const fileUploads = []
  const radiobuttons = []
  const checkboxes = []

  const addButtonToQuery = button => {
    clickedButtons.push(button)
  }

  // eslint-disable-next-line
      // TODO: implement
  const fromNativeCharset = string => string

  const processQuery = field => {
    const queryValue = field.queryValue() || []
    return queryValue.map(element => [
      fromNativeCharset(element[0]),
      fromNativeCharset(element[1].toString()),
    ])
  }

  const buildQuery = () => {
    let successfulControls

    successfulControls = fields.filter(field => !field.disabled)
    successfulControls = successfulControls.concat(
      checkboxes
        .filter(checkbox => !checkbox.disable && checkbox.isChecked())
    )
    successfulControls = successfulControls.concat(clickedButtons)

    return successfulControls.reduce(
      (query, control) => query.concat(processQuery(control)),
      []
    )
  }

  const encodeMultipart = (queryParams) => {
    const params = []
    queryParams.forEach(queryParam => {
      if (queryParam[0]) {
        params.push(paramToMultipart({
          name: queryParam[0],
          value: queryParam[1],
        }))
      }
    })
    fileUploads.forEach(fileUpload => {
      params.push(fileToMultipart(fileUpload))
    })
    return params.map(param => '--' + boundary + '\r\n' + param)
      .join('') + '--' + boundary + '--\r\n'
  }

  const encodeText = (queryParams) =>
    queryParams.map(queryParam => queryParam.join('=')).join('\n')

  const requestData = (enctype) => {
    const queryParams = buildQuery()

    if (enctype === 'multipart/form-data') {
      return encodeMultipart(queryParams)
    } else if (enctype === 'text/plain') {
      return encodeText(queryParams)
    }
    return buildQueryString(queryParams)
  }

  const field = name => fields.filter(field => field.name === name)[0]

  const checkbox = name => checkboxes.filter(field => field.name === name)[0]

  // eslint-disable-next-line object-curly-newline
  const addField = (name, value) => fields.push(newField({ name }, value))

  const deleteField = name => {
    const index = fields.findIndex(field => field.name === name)
    if (index >= 0) {
      fields.splice(index, 1)
    }
  }

  const setFieldValue = (name, value) => {
    const f = field(name)
    if (f) {
      f.setValue(value)
    } else {
      addField(name, value)
    }
  }

  const fieldValue = (name) => field(name) && field(name).value()

  const labelFor = id => page.labelFor(id)

  const submitButton = () =>
    buttons.filter(button => button.fieldType === 'submit')[0]

  const submit = ({ button, headers, requestOptions }) => page.submit({
    form,
    button,
    headers,
    requestOptions,
  })

  const allFields = () => radiobuttons
    .concat(checkboxes)
    .concat(fileUploads)
    .concat(buttons)
    .concat(fields)

  const initializeFields = () => {
    if (node) {
      search(node, '//input').forEach(node => {
        const type = (nodeAttr(node, 'type') || 'text')
          .toLocaleLowerCase()
        switch (type) {
          case 'radio':
            radiobuttons.push(newRadioButton(node, form))
            break
          case 'checkbox':
            checkboxes.push(newCheckbox(node, form))
            break
          case 'file':
            fileUploads.push(newFileUpload(node))
            break
          case 'submit':
            buttons.push(newSubmit(node))
            break
          case 'button':
            buttons.push(newButton(node))
            break
          case 'reset':
            buttons.push(newReset(node))
            break
          case 'image':
            buttons.push(newImageButton(node))
            break
          case 'hidden':
            fields.push(newHidden(node))
            break
          case 'text':
            fields.push(newText(node))
            break
          case 'textarea':
            fields.push(newTextarea(node))
            break
          default:
            fields.push(newField(node))
        }
      })

      search(node, '//textarea').forEach(node => {
        const name = nodeAttr(node, 'name')
        if (name) {
          fields.push(newTextarea(node))
        }
      })

      search(node, '//select').forEach(node => {
        const name = nodeAttr(node, 'name')
        if (name) {
          if (nodeAttr(node, 'multiple')) {
            fields.push(newMultiSelectList(node))
          } else {
            fields.push(newSelectList(node))
          }
        }
      })

      // eslint-disable-next-line
          // FIXME: what can I do with the reset buttons?
      search(node, '//button').forEach(node => {
        const type = (nodeAttr(node, 'type') &&
                          nodeAttr(node, 'type').toLowerCase()) || 'submit'
        if (type !== 'reset') {
          buttons.push(newButton(node))
        }
      })
    }
  }

  Object.assign(form, {
    action,
    addButtonToQuery,
    addField,
    buildQuery,
    checkbox,
    deleteField,
    enctype,
    field,
    fieldValue,
    fields: allFields,
    labelFor,
    method,
    name,
    noValidate,
    page,
    requestData,
    setFieldValue,
    submit,
    submitButton,
    target,
  })

  initializeFields()

  return Object.freeze(form)
}

exports.newForm = newForm
