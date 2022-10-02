import React from 'react'
import AppViews from './views/AppViews.js'
import DeployerViews from './views/DeployerViews.js'
import AttacherViews from './views/AttacherViews.js'
import {renderDOM, renderView} from './views/render.js'
import './index.css'
import * as backend from './build/index.main.mjs'
import { loadStdlib } from '@reach-sh/stdlib'
const reach = loadStdlib(process.env)

// import My_ALGO wallet
import { ALGO_MyAlgoConnect as MyAlgoConnect }
  from '@reach-sh/stdlib';
reach.setWalletFallback(reach.walletFallback({
  providerEnv: 'TestNet', MyAlgoConnect
}));

const fingerToInt = {'ZEROF':0, 'ONEF':1, 'TWOF':2, 'THREEF':3, 'FOURF':4, 'FIVEF':5}
const totalToInt = {'ZEROT':0, 'ONET':1, 'TWOT':2, 'THREET':3, 'FOURT':4,
                    'FIVET':5, 'SIXT':6, 'SEVENT':7, 'EIGHTT':8, 'NINET':9, 
                    'TENT':10}
const intToOutcome = ['Bob wins', 'Peter wins', 'Both wins', 'Both lose']
const {standardUnit} = reach
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {view: 'ConnectAccount', ...defaults}
  }
  async componentDidMount(){
    const acc = await reach.getDefaultAccount()
    const balAtomic = await reach.balanceOf(acc)
    const bal = reach.formatCurrency(balAtomic, 4)
    this.setState({acc, bal})
    if(await reach.canFundFromFaucet()){
      this.setState({view: 'FundAccount'})
    }else{
      this.setState({view: 'DeployerOrAttacher'})
    }
  }
  async fundAccount(fundAmount){
    await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount))
    this.setState({view: 'DeployerOrAttacher'})
  }
  async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'})}
  selectAttacher() { this.setState({view: 'Wrapper', ContentView: Attacher})}
  selectDeployer() { this.setState({view: 'Wrapper', ContentView: Deployer})}
  
  render(){ return renderView(this, AppViews) }
}

class Player extends React.Component {
  random(){ return reach.hasRandom.random() }
  informTimeout() { this.setState({view: 'Timeout'}) }
  async guessNumber() {
    const num = await new Promise(resolveNumP => {
      this.setState({view: 'GuessNumber', playable:true, resolveNumP})
    })
    this.setState({view: 'WaitingForResults', num})
    return fingerToInt[num]
  }
  playFinger(num) { this.state.resolveNumP(num)}
  async guessTotal() {
    const ttl = await new Promise(resolveTtlP => {
      this.setState({view: 'GuessTotal', playable:true, resolveTtlP})
    })
    this.setState({view: 'WaitingForResults', ttl})
    return totalToInt[ttl]
  }
  getTotal(ttl) { this.state.resolveTtlP(ttl)}
  seeResult(aTotal, fBob, fPeter, scB, scP, rWinner) { 
    const rW = intToOutcome[rWinner]
    let bobScore = parseInt(scB)
    let peterScore = parseInt(scP)
    if(rW == 'Bob wins'){ ++bobScore }
    else if(rW == 'Peter wins'){ ++peterScore }
    this.setState({view: 'SeeResult', aTotal:parseInt(aTotal), 
                  fBob:parseInt(fBob), fPeter:parseInt(fPeter),
                  scB:bobScore, scP:peterScore, 
                  rWinner:rW})
  }
  done(fWinner) { this.setState({view: 'Done', fWinner: intToOutcome[fWinner]})}
}

class Deployer extends Player {
  constructor(props) {
    super(props)
    this.state = {view: 'SetWager'}
  }
  setWager(wager) { this.setState({view: 'Deploy', wager}) }
  async deploy() {
    const ctc = this.props.acc.contract(backend)
    this.setState({view: 'Deploying', ctc})
    this.wager = reach.parseCurrency(this.state.wager)
    this.deadline = {ETH:100, ALGO:100, CFX: 1000}[reach.connector]
    backend.Bob(ctc, this)
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2)
    this.setState({view: 'WaitingForAttacher', ctcInfoStr})
  }
  render() { return renderView(this, DeployerViews) }
}

class Attacher extends Player {
  constructor(props) {
    super(props)
    this.state = {view: 'Attach'}
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr))
    this.setState({view: 'Attaching'})
    backend.Peter(ctc, this)
  }
  async acceptWager(wagerAtomic) {
    const wager = reach.formatCurrency(wagerAtomic, 4)
    return await new Promise(resolveAcceptedP => {
      this.setState({view: 'AcceptTerms', wager, resolveAcceptedP})
    })
  }
  termsAccepted(){
    this.state.resolveAcceptedP()
    this.setState({view: 'WaitingForTurn'})
  }
  render() { return renderView(this, AttacherViews) }
}

renderDOM(<App />)