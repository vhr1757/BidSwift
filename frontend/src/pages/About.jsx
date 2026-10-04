import Navbar from "../components/Navbar.jsx";

import "./About.css";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      <main className="about-container">
        <section className="about-hero">
          <h1>About BidSwift</h1>

          <p>
            BidSwift is an online auction platform that makes buying and selling
            through auctions simple, transparent, and interactive.
          </p>
        </section>

        <section className="about-section">
          <h2>What is BidSwift?</h2>

          <p>
            BidSwift allows sellers to list items, auctioneers to manage
            auctions, and buyers to participate in live bidding. The platform is
            designed to provide a smooth auction experience from listing an item
            to completing the purchase.
          </p>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>

          <div className="about-features">
            <div className="about-feature">
              <h3>1. Discover</h3>

              <p>
                Browse available auctions and discover items that interest you.
              </p>
            </div>

            <div className="about-feature">
              <h3>2. Bid</h3>

              <p>
                Registered buyers can participate in auctions and place
                competitive bids.
              </p>
            </div>

            <div className="about-feature">
              <h3>3. Win</h3>

              <p>
                The highest eligible bidder at the end of an auction becomes the
                winner.
              </p>
            </div>

            <div className="about-feature">
              <h3>4. Complete</h3>

              <p>
                Orders and payments are handled through the BidSwift platform.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;
