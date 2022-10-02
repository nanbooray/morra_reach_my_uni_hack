import React from 'react';

const exports = {};

// Player views must be extended.
// It does not have its own Wrapper view.

exports.GuessNumber = class extends React.Component {
  render() {
    const {parent, playable, num} = this.props;
    return (
      <div>
        {num ? 'Pick again.' : ''}
        <br />
        {!playable ? 'Please wait...' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.playFinger('ZEROF')}
        >Zero Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFinger('ONEF')}
        >One Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFinger('TWOF')}
        >Two Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFinger('THREEF')}
        >Three Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFinger('FOURF')}
        >Four Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.playFinger('FIVEF')}
        >Five Finger</button>
      </div>
    );
  }
}

exports.GuessTotal = class extends React.Component {
  render() {
    const {parent, playable, ttl} = this.props;
    return (
      <div>
        {ttl ? 'Guess a total again.' : ''}
        <br />
        {!playable ? 'Please wait...' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('ZEROT')}
          >Total Zero Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('ONET')}
        >Total One Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('TWOT')}
        >Total Two Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('THREET')}
        >Total Three Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('FOURT')}
        >Total Four Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('FIVET')}
        >Total Five Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('SIXT')}
        >Total Six Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('SEVENT')}
        >Total Seven Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('EIGHTT')}
        >Total Eight Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('NINET')}
        >Total Nine Finger</button>
        <button
          disabled={!playable}
          onClick={() => parent.getTotal('TENT')}
        >Total Ten Finger</button>
      </div>
    );
  }
}

exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.SeeResult = class extends React.Component {
  render() {
    const {aTotal, fBob, fPeter, scB, scP, rWinner} = this.props
    return (
      <div>
        The actual total of this round = {aTotal}
        <br />
        Bob selected finger = {fBob}
        <br />
        Peter selected finger = {fPeter}
        <br />
        <div id='scoreBoard'>
          Current Round Result:
          <br />
          Current Round Winner: {rWinner}
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bob</td>
                <td>{scB}</td>
              </tr>
              <tr>
                <td>Peter</td>
                <td>{scP}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    )
  }
}

exports.Done = class extends React.Component {
  render() {
    const {fWinner} = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this game was:
        <br />{fWinner || 'Unknown'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

export default exports;