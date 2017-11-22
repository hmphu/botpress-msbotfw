import React from 'react'

import {
  Form,
  FormGroup,
  FormControl,
  Col,
  Button,
  ControlLabel
} from 'react-bootstrap'

import _ from 'lodash'
import axios from 'axios'

import style from './style.scss'

export default class MsBotFwModule extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      applicationID: '',
      applicationPassword: '',
      hashState: null
    }
  }

  componentDidMount() {
    this.fetchConfig()
  }

  getAxios = () => this.props.bp.axios
  mApi = (method, url, body) => this.getAxios()[method]('/api/botpress-msbotfw' + url, body)
  mApiGet = (url, body) => this.mApi('get', url, body)
  mApiPost = (url, body) => this.mApi('post', url, body)

  fetchConfig = () => {
    return this.mApiGet('/config').then(({data}) => {
      this.setState({
        applicationID: data.applicationID,
        applicationPassword: data.applicationPassword,
        loading: false
      })

      setImmediate(() => {
        this.setState({
          hashState: this.getHashState()
        })
      })
    })
  }

  getHashState = () => {
    const values = _.omit(this.state, ['loading', 'hashState'])
    return _.join(_.toArray(values), '_')
  }

  getParameterByName = (name) => {
    const url = window.location.href
    name = name.replace(/[\[\]]/g, "\\$&")
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, " "))
  }

  handleChange = event => {
    const { name, value } = event.target

    this.setState({
      [name]: value
    })
  }

  handleSaveConfig = () => {
    this.mApiPost('/config', {
      applicationID: this.state.applicationID,
      applicationPassword: this.state.applicationPassword
    })
    .then(({data}) => {
      this.fetchConfig()
    })
    .catch(err => {
      console.log(err)
    })
  }

handleReset = () => {
  this.setState({
    apiToken: '',
    botToken: ''
  })

  setImmediate(() => {
    this.setState({ hashState: this.getHashState()})
    this.handleSaveConfig()
  })
}

  // ----- render functions -----

  renderHeader = title => (
    <div className={style.header}>
      <h4>{title}</h4>
      {this.renderSaveButton()}
    </div>
  )

  renderLabel = label => {
    return (
      <Col componentClass={ControlLabel} sm={3}>
        {label}
      </Col>
    )
  }

  renderInput = (label, name, props = {}) => (
    <FormGroup>
      {this.renderLabel(label)}
      <Col sm={7}>
        <FormControl name={name} {...props}
          value={this.state[name]}
          onChange={this.handleChange} />
      </Col>
    </FormGroup>
  )

  renderTextInput = (label, name, props = {}) => this.renderInput(label, name, {
    type: 'text', ...props
  })

  renderSaveButton = () => {
    let opacity = 0
    if (this.state.hashState && this.state.hashState !== this.getHashState()) {
      opacity = 1
    }

    return <Button
        className={style.formButton}
        style={{opacity: opacity}}
        onClick={this.handleSaveConfig}>
          Save
      </Button>
  }

  renderConfigSection = () => {
    return (
      <div className={style.section}>
        {this.renderHeader('Configuration')}
    
        {this.renderTextInput('Application ID', 'applicationID', {
          placeholder: 'Paste your application id here...'
        })}
    
        {this.renderTextInput('Application Password', 'applicationPassword', {
          placeholder: 'Paste your application password here...'
        })}
      </div>
    )
  }


  render() {
    if (this.state.loading) return null

    return <Col md={10} mdOffset={1}>
        <Form horizontal>
          {this.renderConfigSection()}
        </Form>
      </Col>
  }
}