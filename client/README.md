<div id="top"></div>
<br />
<div align="center">

<a href="https://www.loom.com/share/9e679a92605549bd9d6ff42d057b295e">
    <p>Hotel ETH - Watch Demo Video</p>
    <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/9e679a92605549bd9d6ff42d057b295e-with-play.gif">
  </a>
  <h3 align="center">Hotel ETH</h3>

  <p align="center">
    A (fictional) Bed-and-Breakfast run on Ethereum
    <br />
     <em>Come Book a Room on Sepolia Testnet</em>
     <br />
    <a href="https://lambypants.github.io/Hotel-ETH/"><strong>View the Demo »</strong></a>
    <br />
    <a  title="contact developer" href="mailto:appsbylamby@gmail.com">Contact Lamby</a>
    ·
    <a href="https://github.com/LambyPants/Hotel-ETH/issues">Report Bug</a>
    ·
    <a href="https://www.linkedin.com/in/ryan-lambert-58202596/"">LinkedIn</a>
  </p>
</div>

#### Table of Contents

  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#obtain-test-ETH">Obtain Test ETH</a></li>
        <li><a href="#install-metamask">Install MetaMask</a></li>
        <li><a href="#running-locally">Running Locally</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#license">License</a></li>
  </ol>

<!-- ABOUT THE PROJECT -->

## About The Project

Hotel ETH is demo project showcasing how a traditional, fixed-price business could be run on Ethereum.

Key features include:

- <strong>An ERC-20 token</strong>
  - can be purchased in advance with ETH at a fixed USD price (using <strong>Chainlink pricing oracles</strong>)
  - can be redeemed for a night at the Hotel (1 token = 1 night).
  - can be refunded to users after redemption if the booking is in the future
- <strong>A full reservation and business management system built with Solidity.</strong>
  - owners can change the fixed USD price of tokens (similar to how hotel rates change)
  - owners receive any proceeds (in ETH) at time of sale
  - owners can mint / burn tokens freely
- <strong>A full front-end interface built in React + Ethers.js</strong>
  - users can purchase tokens at a price set by the owner (paid in ETH)
  - users can redeem + refund tokens used to book reservations at the Hotel
  - users can see / check availibilty at the hotel and view all of their previous reservations
  - the UI dynamically updates when other users make reservations at the Hotel
  - the UI/UX performs automatic field + action validation
- <strong>A development pipelines built for local, rinkeby, and kovan network environments.</strong>

This project is meant for educational purposes only, but in theory you could extend the functionality to run a real (or virtual) business with the underlying infrastructure.

### Built With

- [Solidity](https://docs.soliditylang.org/en/v0.8.11/)
- [Chainlink Oracles](https://data.chain.link/)
- [Hardhat](https://hardhat.org/getting-started/)
- [Ethers.js](https://docs.ethers.io/v5/single-page/)
- [React.js](https://reactjs.org/)
- [Redux (slices)](https://redux-toolkit.js.org/api/createslice)

## Getting Started

### Install MetaMask

You will need an Ethereum wallet installed to use the demo or run this project locally. I recommend [MetaMask](https://metamask.io/).

### Obtain Test ETH

Obtaining test ETH is harder than it should be. 2024 update - it's even harder now. Good luck! I recommend the [Chainlink](https://faucets.chain.link/) faucet.

### Buy, Redeem and Refund Tokens

You can purchase tokens in the app after connecting your wallet. the Price is set by the Hotel Owner and is paid in ETH.

The app is deployed on Sepolia Testnet.

### Running Locally

_For Developers_

1. Clone the repo
   ```sh
   git clone https://github.com/LambyPants/Hotel-ETH
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run local blockchain + development server

   ```sh
   npm run dev
   ```

   To deploy your own version of the app, you need to fill in the `keys.js` file generated for you on install:

   ```js
   module.exports = {
     DEPLOY_PRIVATE_KEY: '',
     ALCHEMY_API_KEY_SEPOLIA: ''
   };
   ```

<!-- CONTACT -->

## Contact

Ryan (Lamby) Lambert - appsbylamby@gmail.com

View my other projects: [https://github.com/LambyPants](https://github.com/LambyPants)

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
