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

//13 ve 1998 in sha3 hashi ile bilet aldım 13 ve 1998 reveal edebilirizz denerken


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
  const [lastOwnedTicket, setLastOwnedTicket] = useState([]);
  const [lotteryQueried, setLotteryQueried] = useState();

  useEffect(() => {  //lotteryNo ve totalmoney otomatik çekiliyor, burayı bir fonksiyonda toparlayıp tüm fonksiyonların içinde çağıradabiliriz
    
    if (lc) {
      const resultInSeconds= Math.floor(new Date().getTime() / 1000);
      getLotteryNo(resultInSeconds);
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
                        <input class="input" type="text" placeholder="Provide random hash beginning by 0x to buy ticket" onChange={e => setHash(e.target.value)}>
                        </input>
                      </div>
                    </div>
                    </section>
                      <div onClick={() => buyTicketHandler(hash)} className='button is-primary is-light mt-3'> Buy Ticket</div>
           
                </section>

                <section className='mt-5'>
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
                        <h2>Lottery History</h2>
                        <div className='history-entry'>
                          <div>Lottery #1 winner: </div>
                          <div>
                            <a href='https://etherscan.io/address/0x16C67983D84474C954c32a9b2fdb3a1aFd6ED7b6'>
                            0x16C67983D84474C954c32a9b2fdb3a1aFd6ED7b6
                            </a>
                          </div>
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
                          <div>Ticket #: Bla bla</div>
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
