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
//tutorial 2.02 de kaldım

export default function Home() {

  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [lc, setLc] = useState();
  const [lotteryMoney, setLotteryMoney] = useState();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lotteryNo, setLotteryNo] = useState();

  useEffect(() => {  //lotteryNo ve totalmoney otomatik çekiliyor
    
    if (lc) {
      const resultInSeconds= Math.floor(new Date().getTime() / 1000);
      getLotteryNo(resultInSeconds);
    }
    if (lc && lotteryNo) getTotalLotteryMoneyCollected(lotteryNo);
  }, [lc, lotteryMoney, lotteryNo])

  const getTotalLotteryMoneyCollected = async (i) => {
      const result = await lc.methods.getTotalLotteryMoneyCollected(i).call();
      setLotteryMoney(result);
  }

  const getLotteryNo = async (time) => {
    const result = await lc.methods.getLotteryNoBySec(time).call();
    setLotteryNo(result);
  }

  const depositTLHandler = async (amount) => {   //şimdilik default 10 veriyoruz ama ui dan parametre almak lazım
    try{
      await lc.methods.depositTL(amount).send({from: account});  //adam buraya gas value falan da yazdı ama lazım mı
      setSuccessMsg('Deposit Successful');   //daha onaylamadan basıyor aq
      setError("");
    }
    catch(err){
      setError(err.message)
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
                  <div onClick={() => depositTLHandler(10)} className='button is-link is-light mt-3'> Deposit TL</div>
                </section>
                <section className='mt-5'>
                  <p>Buy ticket with 10 TL</p>
                  <div className='button is-primary is-light mt-3'> Buy Ticket</div>
                </section>
                <section className='mt-5'>
                  <div className='button is-link is-light mt-3'> Withdraw TL</div>
                </section>
              </div>
              <div className='${styles.lotteryinfo} column is-one-third'>
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
