import React, { Component } from "react";
import bigmac from './big-mac-index.csv'
const d3 = require("d3");

class App extends Component {
  state = {
    arrayCSV: null,
    arrayCountry: null,
    localCountry: null,
    localCountryCSV: null,
    input: null,
    randCountry: null,
    randCountryCSV: null
  }

  async componentDidMount() {
    //get user's ip address
    const ip = await fetch('https://api.ipify.org/?format=json')
    .then(res => res.json())
    .then(resJSON => { return resJSON.ip })
    //use ip address to fetch user's country
    const localCountry = await fetch(`https://ipvigilante.com/json/${ip}/country_name`)
    .then(res => res.json())
    .then(resJSON => {
      return resJSON.data.country_name
    })
    //convert csv to array
    const arrayCSV = await d3.csv(bigmac)
    //pull the most recent entry for user's country from big mac index
    const localCountryCSV = arrayCSV.filter(country => country['Country'] == localCountry).reverse()[0]
    //get unique set of countries from big mac index
    let arrayCountry = []
    for(let i = 0; i < arrayCSV.length; i++) {
      if(!arrayCountry.find(country => country == arrayCSV[i]['Country'])) {
        arrayCountry.push(arrayCSV[i]['Country'])
      }
    }
    //omit user's country from list of unique countries
    arrayCountry = arrayCountry.filter(country => country !== localCountry)
    
    this.setState({ arrayCSV, arrayCountry, localCountry, localCountryCSV })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { money } = e.target
    //get random country and save it to state
    const randIndex = Math.floor(Math.random() * this.state.arrayCountry.length)
    const randCountry = this.state.arrayCountry[randIndex]
    const randCountryCSV = this.state.arrayCSV.filter(country => country['Country'] == randCountry).reverse()[0]
    
    this.setState({input: money.value, randCountry, randCountryCSV})
  }

  render() {
    const { localCountry, localCountryCSV, input, randCountry, randCountryCSV } = this.state
    let localBigMacs = 0
    let randBigMacs = 0
    let randDollarPrice = 0
    if(input) {
      localBigMacs = Math.floor(input / localCountryCSV['Local price'])
      //calculation is (INPUT / local price) * (local dollarprice / RAND COUNTRY dollar price)
      randBigMacs = Math.floor((input / localCountryCSV['Local price']) * (localCountryCSV['Dollar price'] / randCountryCSV['Dollar price']))
      //Calculation is [INPUT] * (local dollar price / RANDCOUNTRY dollar price)
      randDollarPrice = Math.round(input * ((localCountryCSV['Dollar price'] / randCountryCSV['Dollar price'])))
    }
    return (
      <main className='App'>
        <section>
          <h1>You are in <span style={{"color":"#fac9b8"}}>{localCountry}</span></h1>
          <form onSubmit={this.handleSubmit}>
            <label htmlFor='money'> Please enter an amount of money in your local currency </label>
            <br />
            <div className='thesetwo'>
              <input
                type='number'
                name='money'
                id='money'
                required
              />
              <button type='submit'> Submit </button>
            </div>
          </form>
        </section>
        {input ? 
          <section>
            <p>You could buy <span style={{"color":"#f48a66"}}>{localBigMacs}</span> Big Macs in your country</p> 
            <p>Your Dollar Purchasing Parity (PPP) is <span style={{"color":"#f48a66"}}>{localCountryCSV['Dollar PPP']}</span></p>
          </section>
        : <div></div>}
        {input ? 
          <section>
            <h2>Random Country: <span style={{"color":"#fac9b8"}}>{randCountry}</span></h2>
            <p>You could buy <span style={{"color":"#f48a66"}}>{randBigMacs}</span> Big Macs in <span style={{"color":"#f48a66"}}>{randCountry}</span> with <span style={{"color":"#f48a66"}}>{input}</span>!</p>
            <p>Your <span style={{"color":"#f48a66"}}>{input}</span> is worth about <span style={{"color":"#f48a66"}}>{randDollarPrice}</span> in <span style={{"color":"#f48a66"}}>{randCountry}</span></p>
          </section>
        : <div></div>}
      </main>
    );
  }
}

export default App;