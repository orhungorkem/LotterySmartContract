import Head from 'next/head'
import styles from '../styles/Home.module.css'
import 'bulma/css/bulma.css'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import lotteryContract from '../blockchain/lottery'

//mt-5 is margin top
//navbar-end is for right part of navbar
//column is-two-thirds means it will take 2/3 of the screen in column

//for large button, use is-large
//lottery history kısmı değişir

//Home.module.css teki değişiklikler buraya yansımıyor gibi?
//lottery info kısmındaki kartlarda bu var: ${styles.lotteryinfo}  takmıyor

// contract address: 0x8614A7657e16a973b13d5Bc12A3526b187225650
//refresh attığımızda wallet disconnect oluyor?

//1.26 da loop var maple
//1.41 ifle check etme renderlarken
//2.11 de json objesine alıyor bilgiyi ve basacak, ith winning ticketta falan işe yarar
//2.32 account change should be updated sometimes, sorun olursa aklına gelsin

//TODO
//refresh attığımızda wallet disconnect oluyor?
//depositTl için input aldıktan sonra inputa girilen amount silinmiyor bakılabilir
//ayrıca infolar güncellenmiyor tekrar connectvalleta basmadan
//fazla para withdraw ederken sözleşmede hata olabilir uyarısı geliyor istediğimiz error yerine
//reveal ticketta yanlis parametreler versek de hata vermiyor cunku solidityde ticketi cancel ediyoruz, ama 
//kullaniciya reveal edilmedigini gostermek gerekir mi
//revert alinca direk error donuyor aq

//13 ve 1998 in sha3 hashi ile bilet aldım 13 ve 1998 reveal edebilirizz denerken
//bendekiler 150 117

//ticketno 0 rnd 13 ile reveal ettim

//lottery 1 de 137 ile bilet aldım ticcket no 7
//1111 ile aldım ticket no 8


export default function Home() {

  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [lc, setLc] = useState();
  const [lotteryMoney, setLotteryMoney] = useState();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lotteryNo, setLotteryNo] = useState();
  const [depositamount, setDepositamount] = useState();
  const [withdrawamount, setWithdrawamount] = useState();
  const [balance, setBalance] = useState();
  const [hash, setHash] = useState();
  const [ticketNo, setTicketNo] = useState();
  const [rndNumber, setRndNumber] = useState();
  const [i, setI] = useState();
  const [ithOwnedTicket, setIthOwnedTicket] = useState([]);
  const [lastOwnedTicket, setLastOwnedTicket] = useState([]);
  const [lotteryQueried, setLotteryQueried] = useState();
  const [prize, setPrize] = useState();
  const [ithWinningTicket, setIthWinningTicket] = useState([]);
  const [txHash, setTxHash] = useState();
  const [ticketCount, setTicketCount] = useState();

  useEffect(() => {  //lotteryNo ve totalmoney otomatik çekiliyor, burayı bir fonksiyonda toparlayıp tüm fonksiyonların içinde çağıradabiliriz
    
    if (lc) {
      const resultInSeconds= Math.floor(new Date().getTime() / 1000);
      getLotteryNo(resultInSeconds);
      getTicketCount();
      getBalanceHandler();
    }
    if (lc && lotteryNo) getTotalLotteryMoneyCollected(lotteryNo);
  }, [lc, lotteryMoney, lotteryNo])

  const getTotalLotteryMoneyCollected = async (i) => {
      const result = await lc.methods.getTotalLotteryMoneyCollected(i).call();    //state variable olan arrayler ve mappingler de olduğu gibi böylr çağrılabilir
      setLotteryMoney(result);
  }

  const getLotteryNo = async (time) => {
    const result = await lc.methods.getLotteryNoBySec(time).call();
    setLotteryNo(result);
  }

  const getTicketCount = async () => {
    const result = await lc.methods.ticketCounter().call();
    setTicketCount(result);
  }


  const depositTLHandler = async (amount) => {   //şimdilik default 10 veriyoruz ama ui dan parametre almak lazım
    try{
      await lc.methods.depositTL(amount).send({from: account});  //adam buraya gas value falan da yazdı ama lazım mı
      setSuccessMsg('Deposit Successful');   
      setError("");
      setDepositamount("");
    }
    catch(err){
      setError(err.message)
      setSuccessMsg("");
      setDepositamount("");
    }
  }

  const withdrawTLHandler = async (amount) => {   //şimdilik default 10 veriyoruz ama ui dan parametre almak lazım
    try{
      await lc.methods.withdrawTL(amount).send({from: account});  //adam buraya gas value falan da yazdı ama lazım mı
      setSuccessMsg('Withdraw Successful');   
      setError("");
      setWithdrawamount("");
    }
    catch(err){
      setError(err.message)
      setSuccessMsg("");
      setWithdrawamount("");
    }
  }

  const getBalanceHandler = async () => {
    const balance = await lc.methods.getBalance().call({from: account});
    setBalance(balance);
  }

  const buyTicketHandler = async (hashrndnumber) => {
    try{
      await lc.methods.buyTicket(hashrndnumber).send({from: account});
      setSuccessMsg('Bought Ticket Successfully');
      setError("");
    }
    catch(err){
      setError(err.message)
      setSuccessMsg("");
    }
  }

  const collectTicketRefundHandler = async (ticketNo) => {
    try {
      await lc.methods.collectTicketRefund(ticketNo).send({from: account}).on('transactionHash', (txhash) => {setTxHash(txhash)});
      setSuccessMsg('Refund Collected Successfully');
      setError("");
    }
    catch(err){
      /*
      console.log(txHash);
      const tx = await web3.eth.getTransaction(txHash);
      console.log(tx)
      
      web3.eth.getTransactionReceipt(txHash, (err2, receipt) => {
        if (err2) {
          console.log(err2);
        }
        else {
          console.log(receipt);
        }
      });
      

    
      const replay_tx = {from: account}

      try{
        web3.eth.call(replay_tx, tx.blockNumber - 1)
      }
      catch(err2){
        console.log(err2)
        setError(err2)
        setSuccessMsg("");
      }
*/

      setError(err.message)
      setSuccessMsg("");
    }
  }

  const revealRndNumberHandler = async (ticketNo, rndNumber) => {
    try {
      await lc.methods.revealRndNumber(ticketNo, rndNumber).send({from: account});
      setSuccessMsg('Revealing Request Done Successfully');
      setError("");
    }
    catch(err) {
      setError(err.message)
      setSuccessMsg("");
    }
  }

  const getIthOwnedTicketNoHandler = async (i, lotteryNo) => {
    try{
      console.log(lotteryNo);
      const result = await lc.methods.getIthOwnedTicketNo(i, lotteryNo).call({from: account});
      console.log(result);
      setIthOwnedTicket(result);
    }
    catch(err){
      setError(err.message)   //lotteryExists modifierında eksiklik yapmışız, yüksek lottery no da kabul edilmemeli 
      //o sebeple bu error kötü görünüyor
      setSuccessMsg("");
    }
}

  const getLastOwnedTicketNoHandler = async (lotteryNo) => {
      try{
        console.log(lotteryNo);
        const result = await lc.methods.getLastOwnedTicketNo(lotteryNo).call({from: account});
        console.log(result);
        setLastOwnedTicket(result);
      }
      catch(err){
        setError(err.message)   //lotteryExists modifierında eksiklik yapmışız, yüksek lottery no da kabul edilmemeli 
        //o sebeple bu error kötü görünüyor
        setSuccessMsg("");
      }
  }

  const checkIfTicketWonHandler = async (ticketNo) => {
    try {
      const result = await lc.methods.checkIfTicketWon(ticketNo).call({from: account});
      setPrize(result);
      setSuccessMsg('Prize for the Given Ticket Calculated Successfully');
      setError("");
    }
    catch(err) {
      setError(err.message);
      setSuccessMsg("");
    }
  }

  const collectTicketPrizeHandler = async (ticketNo) => {
    try {
      await lc.methods.collectTicketPrize(ticketNo).send({from: account});
      setSuccessMsg('Prize Collected Successfully');
      setError("");
    }
    catch(err) {
      setError(err.message);
      setSuccessMsg("");
    }
  }
  
  const getIthWinningTicketHandler = async (i, lotteryNo) => {
    try {
      const result = await lc.methods.getIthWinningTicket(i, lotteryNo).call({from: account});
      setIthWinningTicket(result);
      setSuccessMsg('Winning Ticket Returned Successfully');
      setError("");
    }
    catch(err) {
      setError(err.message);
      setSuccessMsg("");
    }
  }

  const connectWalletHandler = async () => {

    
    if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {  //if metamask is installed and ethereum injected

      try{
        
        await window.ethereum.request({ method: 'eth_requestAccounts' });   //request wallet connection
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        const lc = await lotteryContract(web3);  //create local instance for contract
        setLc(lc);
        setSuccessMsg('Wallet connected');
        setError("");
      }
      catch(error){
        setError(error.message);
        setSuccessMsg("");
      }
      
    }
    else{
      setError("Metamask not installed");
      setSuccessMsg("");
    }
  }
  
  return (
    <div >
      <Head>
        <title>Lottery</title>
        <meta name="description" content="Decentralized app for lottery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className='navbar mt-4 mb-4'>
          <div className='container'>
            <div className='navbar-brand'>  
            <h1 class="title is-2"> Lottery App</h1>
            
            </div>
            <div className='navbar-end'>
              <button onClick={connectWalletHandler} className='button is-link'>Connect Wallet</button>
            </div>
          </div>
        </nav>
        <div className='container'>
          <section className='mt-5'>
            <div className='columns'>
              <div className='column is-two-thirds'>

                <section>
                  <div className='container has-text-danger'>
                    <p>{error}</p>
                  </div>
                </section>
                <section>
                  <div className='container has-text-success'>
                    <p>{successMsg}</p>
                  </div>
                </section>

      
                

                <section className='mt-5'>
                  <p>Deposit TL to buy tickets</p>
                  <div class="columns">
                    <div class="column is-one-third">                  
                      <section className='mt-2'>
                        <div class="field">
                        <div class="control">
                          <input class="input" type="text" placeholder="Amount of TL to deposit" onChange={e => setDepositamount(e.target.value)}>
                          </input>
                        </div>
                        </div>
                      </section>
                      <div onClick={() => depositTLHandler(depositamount)} className='button is-link is-light mt-3'> Deposit TL</div>
                    </div>
                  </div>
                </section>

                  <section className='mt-5'>
                  <p>Withdraw TL from your account</p>
                  <div class="columns">
                    <div class="column is-one-third">                  
                      <section className='mt-2'>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Amount of TL to withdraw" onChange={e => setWithdrawamount(e.target.value)}>
                        </input>
                      </div>
                    </div>
                    </section>
                      <div onClick={() => withdrawTLHandler(withdrawamount)} className='button is-link is-light mt-3'> Withdraw TL</div>
                      </div>
                    </div>
                  </section>

                <section className='mt-5'>
                  <p>Buy ticket with 10 TL</p>
                  <section className='mt-2'>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Random hash beginning by 0x to buy ticket" onChange={e => setHash(e.target.value)}>
                        </input>
                      </div>
                    </div>
                    </section>
                      <div onClick={() => buyTicketHandler(hash)} className='button is-primary is-light mt-3'> Buy Ticket</div>
                </section>
              
                <section className='mt-5'>
                  <p>Collect ticket refund</p>
                  <section className='mt-2'>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Ticket number" onChange={e => setTicketNo(e.target.value)}>
                        </input>
                      </div>
                    </div>
                    </section>
                      <div onClick={() => collectTicketRefundHandler(ticketNo)} className='button is-primary is-light mt-3'> Collect ticket refund</div>
                </section>

                <section className='mt-5'>
                  <p>Reveal ticket with your random number</p>
                  <section className='mt-2'>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Ticket number" onChange={e => setTicketNo(e.target.value)}>
                        </input>
                      </div>
                    </div>
                    </section>
                    <section className='mt-2'>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Random number associated with the ticket" onChange={e => setRndNumber(e.target.value)}>
                        </input>
                      </div>
                    </div>
                    </section>
                      <div onClick={() => revealRndNumberHandler(ticketNo, rndNumber)} className='button is-primary is-light mt-3'> Reveal Ticket</div>
                </section>

                <section className='mt-5'>
                <p>Get your ith owned ticket in a lottery</p>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="The index of the ticket for the user" onChange={e => setI(e.target.value)}>
                        </input>
                      </div>
                    </div>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Lottery no to get ith owned ticket no" onChange={e => setLotteryQueried(e.target.value)}>
                        </input>
                      </div>
                    </div>
                      <div onClick={() => getIthOwnedTicketNoHandler(i, lotteryQueried)} className='button is-primary is-light mt-1'> Get ith owned ticket no</div>
                      <div className='mt-5'>{i}th owned ticket no in lottery #{lotteryQueried}: {ithOwnedTicket[0]} </div>
                      <div>{i}th owned ticket status in lottery #{lotteryQueried}: {ithOwnedTicket[1]} </div>
                </section>

                <section className='mt-5'>
                <p>Get your last owned ticket in a lottery</p>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Lottery no to get last owned ticket no" onChange={e => setLotteryQueried(e.target.value)}>
                        </input>
                      </div>
                    </div>
                      <div onClick={() => getLastOwnedTicketNoHandler(lotteryQueried)} className='button is-primary is-light mt-1'> Get last owned ticket no</div>
                      <div className='mt-5'>Last owned ticket no in lottery #{lotteryQueried}: {lastOwnedTicket[0]} </div>
                      <div>Last owned ticket status in lottery #{lotteryQueried}: {lastOwnedTicket[1]} </div>
                </section>

                <section className='mt-5'>
                <p>Check if ticket has won</p>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Ticket number" onChange={e => setTicketNo(e.target.value)}>
                        </input>
                      </div>
                    </div>
                      <div onClick={() => checkIfTicketWonHandler(ticketNo)} className='button is-primary is-light mt-1'> Get prize</div>
                      <div className='mt-5'>Prize won by the given ticket: {prize} </div>
                </section>

                <section className='mt-5'>
                <p>Collect ticket prize</p>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Ticket number" onChange={e => setTicketNo(e.target.value)}>
                        </input>
                      </div>
                    </div>
                      <div onClick={() => collectTicketPrizeHandler(ticketNo)} className='button is-primary is-light mt-1'> Collect prize</div>
                </section>

                <section className='mt-5'>
                <p>Get ith winning ticket in a lottery</p>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="The index of the ticket" onChange={e => setI(e.target.value)}>
                        </input>
                      </div>
                    </div>
                      <div class="field">
                      <div class="control">
                        <input class="input" type="text" placeholder="Lottery no to get ith winning ticket" onChange={e => setLotteryQueried(e.target.value)}>
                        </input>
                      </div>
                    </div>
                      <div onClick={() => getIthWinningTicketHandler(i, lotteryQueried)} className='button is-primary is-light mt-1'> Get ith winning ticket</div>
                      <div className='mt-5'>{i}th winning ticket no in lottery #{lotteryQueried}: {ithWinningTicket[0]} </div>
                      <div>Prize won by the {i}th winning ticket in lottery #{lotteryQueried}: {ithWinningTicket[1]} </div>
                </section>

              
              </div>


              <div className='${styles.lotteryinfo} column is-one-third'>

                <section className='mt-5'>
                  <div className='card'>
                    <div className='card-content'>
                      <div className='content'>
                        <h2>User Information</h2>
                        <div className='history-entry'>
                          <div>Balance: {balance} TL</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </section>



                  <section className='mt-5'>
                  <div className='card'>
                    <div className='card-content'>
                      <div className='content'>
                        <h2>Ticket History</h2>
                        <div className='history-entry'>
                          <div>Last Ticket #: {ticketCount - 1}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </section>

                  <section className='mt-5'>
                  <div className='card'>
                    <div className='card-content'>
                      <div className='content'>
                        <h2>Current Lottery</h2>
                        <div className='history-entry'>
                          <div>No#: {lotteryNo}</div>
                        </div>
                        <div className='history-entry'>
                          <div>Total Money Collected: {lotteryMoney} TL</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </section>


              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 İnan Görkem İşbirliği </p>
      </footer>
    </div>
  )
}
