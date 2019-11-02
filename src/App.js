import React, { Component, Fragment } from 'react'
import './App.css'
import Navigation from './components/Navigation/Navigation'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js'

const particlesOptions = {
  particles: {
    number: {
      value: 120,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }

  calculateFaceLocation = clarifaiFace => {
    console.log('claraifai', clarifaiFace)

    const image = document.getElementById('inputimage')
    const width = image.width
    const height = image.height
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    }
  }

  displayFaceBox = box => {
    this.setState({ box })
  }

  onInputChange = event => {
    const input = event.target.value
    this.setState({ input }, () => console.log(input))
  }

  onButtonSubmit = () => {
    const imageUrl = this.state.input
    this.setState({ imageUrl })
    fetch('http://localhost:3000/detectFace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: imageUrl
      })
    })
      .then(detectFace => detectFace.json())
      .then(response => {
        if (response.status && response.status === 'success') {
          fetch('http://localhost:3000/image', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(resp => {
              return resp.json()
            })
            .then(entries => {
              if (entries) {
                this.setState(
                  prevState => ({
                    user: {
                      ...prevState.user,
                      entries
                    }
                  }),
                  () => {
                    console.log('asdsadsa', response)
                    this.displayFaceBox(
                      this.calculateFaceLocation(response.coords)
                    )
                  }
                )
              }
            })
            .catch(e => {
              console.log('error', e)
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  onRouteChange = route => {
    if (route === 'signout') {
      this.setState(initialState, () => {
        this.setState({ route })
      })
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    } else if (route === 'register') {
    }
    this.setState({ route })
  }

  loadUser = user => {
    console.log('user', user)

    this.setState({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        entries: user.entries,
        joined: user.joined
      }
    })
  }

  render() {
    const {
      route,
      isSignedIn,
      box,
      imageUrl,
      user: { name, entries }
    } = this.state

    return (
      <div className='App'>
        <Particles params={particlesOptions} className='particles' />
        <Navigation
          onRouteChange={this.onRouteChange}
          isSignedIn={isSignedIn}
        />
        {((route === 'signin' || route === 'signout') && (
          <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        )) ||
          (route === 'register' && (
            <Register
              onRouteChange={this.onRouteChange}
              loadUser={this.loadUser}
            />
          )) ||
          (route === 'home' && (
            <Fragment>
              <Logo />
              <Rank name={name} entries={entries} />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition imageUrl={imageUrl} box={box} />
            </Fragment>
          ))}
      </div>
    )
  }
}
