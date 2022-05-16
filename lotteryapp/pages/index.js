import Head from 'next/head'
import styles from '../styles/Home.module.css'
import 'bulma/css/bulma.css'


//mt-5 is margin top
//navbar-end is for right part of navbar
//column is-two-thirds means it will take 2/3 of the screen in column

//for large button, use is-large
//lottery history kısmı değişir

//Home.module.css teki değişiklikler buraya yansımıyor gibi?
//lottery info kısmındaki kartlarda bu var: ${styles.lotteryinfo}  takmıyor

export default function Home() {
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
              <button className='button is-link'>Connect Wallet</button>
            </div>
          </div>
        </nav>
        <div className='container'>
          <section className='mt-5'>
            <div className='columns'>
              <div className='column is-two-thirds'>
                <section className='mt-5'>
                  <p>Deposit TL to buy tickets</p>
                  <div className='button is-link is-light mt-3'> Deposit TL</div>
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
                          <div>No#: 7</div>
                        </div>
                        <div className='history-entry'>
                          <div>Total Money Collected: 1990 TL</div>
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
