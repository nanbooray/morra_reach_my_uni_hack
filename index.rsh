'reach 0.1'

const [numFinger, ZERO, ONE, TWO, THREE, FOUR, FIVE] = makeEnum(6);
const [guessTotal, ZEROT, ONET, TWOT, THREET, FOURT, FIVET, SIXT, SEVENT, EIGHTT, NINET, TENT] = makeEnum(11);
const [gameOutcome, Bob_wins, Peter_wins, Both_wins, Both_lose] = makeEnum(4);
const isWinner = (numBob, numPeter, ttlBob, ttlPeter) => {
  const total = numBob+numPeter;
  if(ttlBob==total && ttlPeter==total){
      const roundWinner = Both_wins;
      return roundWinner;
      //return Both_wins
  }else {
    if(ttlBob!=total && ttlPeter!=total){
      const roundWinner = Both_lose
      return roundWinner
    } else{
      if(ttlBob==total && ttlPeter!=total){
        const roundWinner = Bob_wins;
        return roundWinner;
        //return Bob_wins
      }else{
        const roundWinner = Peter_wins;
        return roundWinner;
        //return Peter_wins
      }
    }
  }
}
  // why not just return, why need to assgn to a const, find this out...


assert(isWinner(ZERO, FIVE, ZEROT, FIVET)==Peter_wins)
assert(isWinner(ZERO, FIVE, FIVET, ZEROT)==Bob_wins)
assert(isWinner(ZERO, ZERO, ZEROT, ZEROT)==Both_wins)
assert(isWinner(ZERO, ZERO, ONET, TWOT)==Both_lose)
assert(isWinner(TWO, TWO, ZEROT, ZEROT)==Both_lose)

forall(UInt, numBob => 
  forall(UInt, numPeter => 
    forall(UInt, ttlBob => 
      forall(UInt, ttlPeter => 
        assert(gameOutcome(isWinner(numBob, numPeter, ttlBob, ttlPeter)))))))

const Player = {
  guessNumber: Fun([], UInt),
  //seeNumber: Fun([UInt], Null),
  guessTotal: Fun([], UInt),
  //guessTotal: Fun([UInt], UInt)
  informTimeout: Fun([], Null),
  //seeActualTotal: Fun([UInt], Null),
  seeResult: Fun([UInt, UInt, UInt, UInt, UInt, UInt], Null),  // (totalF, fB, fP, scB, scP, rWinner)
  ...hasRandom,
  done: Fun([UInt], Null)
};

// main
export const main = Reach.App(() => {
  const Bob = Participant('Bob', {
    ...Player,
    wager: UInt,
    deadline: UInt
  });
  const Peter = Participant('Peter', {
    ...Player,
    acceptWager: Fun([UInt], Null)
  });
  init();

  const informTimeout = () => {
    each([Bob, Peter], () => {
      interact.informTimeout();
    });
  };

  Bob.only(() => {
    const wager = declassify(interact.wager);
    const deadline = declassify(interact.deadline);
  })
  Bob.publish(wager, deadline)
    .pay(wager);
  commit();

  Peter.only(() => {
    interact.acceptWager(wager)
  })
  Peter.pay(wager)
      .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout))
  
  var [scoreB, scoreP] = [0,0]
  invariant(balance() == 2 * wager)
  while(scoreB!=3 && scoreP!=3){
    commit()

    Bob.only(() => {
      const _numBob = interact.guessNumber()
      const _ttlBob = interact.guessTotal()
      const [_commitBob, _saltBob] = makeCommitment(interact, _numBob)
      const commitBob = declassify(_commitBob)
      const [_ttlCommitBob, _ttlSaltBob] = makeCommitment(interact, _ttlBob)
      const ttlCommitBob = declassify(_ttlCommitBob)
    })
    Bob.publish(commitBob)
      .timeout(relativeTime(deadline), () => closeTo(Peter, informTimeout))
    commit()
    Bob.publish(ttlCommitBob)
      .timeout(relativeTime(deadline), () => closeTo(Peter, informTimeout))
    commit()

    unknowable(Peter, Bob(_numBob, _saltBob))
    unknowable(Peter, Bob(_ttlBob, _ttlSaltBob))

    Peter.only(() => {
      const numPeter = declassify(interact.guessNumber())
      const ttlPeter = declassify(interact.guessTotal())
    })
    Peter.publish(numPeter, ttlPeter)
        .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout))
    commit()
    
    Bob.only(() => {
      const saltBob = declassify(_saltBob)
      const ttlSaltBob = declassify(_ttlSaltBob)
      const numBob = declassify(_numBob)
      const ttlBob = declassify(_ttlBob)
    })
    Bob.publish(saltBob, numBob)
      .timeout(relativeTime(deadline), () => closeTo(Peter, informTimeout));
    checkCommitment(commitBob, saltBob, numBob);
    commit();

    Bob.publish(ttlBob, ttlSaltBob)
      .timeout(relativeTime(deadline), () => closeTo(Peter, informTimeout));
    checkCommitment(ttlCommitBob, ttlSaltBob, ttlBob);
    commit();

    Peter.only(() => {
      const total = numBob+numPeter
      const roundWinner = isWinner(numBob, numPeter, ttlBob, ttlPeter)
      interact.seeResult(numBob+numPeter, numBob, numPeter, scoreB, scoreP, roundWinner)
    })
    Peter.publish(total, roundWinner)
        .timeout(relativeTime(deadline), ()=>closeTo(Bob, informTimeout))
    commit()

    Bob.only(()=>{
      interact.seeResult(total, numBob, numPeter, scoreB, scoreP, roundWinner)
    })
    Bob.publish()
      .timeout(relativeTime(deadline), ()=>closeTo(Peter, informTimeout))

    if(roundWinner == Bob_wins){
        scoreB = scoreB+1
        continue
    }else{
      if(roundWinner == Peter_wins){
        scoreP = scoreP+1
        continue
      }
    }
    continue
  }

  assert(scoreB==3 || (scoreP==3 ))
  transfer(2*wager).to(scoreB==3 ? Bob : Peter)
  commit()

  const finalWinner = scoreB == 3 ? 1 : 2
  each([Bob, Peter], () => {
    interact.done(finalWinner)
  })

})