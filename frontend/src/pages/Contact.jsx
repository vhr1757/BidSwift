import Navbar from "../components/Navbar.jsx";

import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">
      <Navbar />

      <main className="contact-container">
        <section className="contact-header">
          <h1>Contact Us</h1>

          <p>
            Have a question, feedback, or need assistance? We'd love to hear
            from you.
          </p>
        </section>

        <section className="contact-content">
          <div className="contact-info">
            <h2>Get in Touch</h2>

            <p>
              If you have any questions about auctions, bidding, selling, or
              using BidSwift, feel free to contact us.
            </p>

            <div className="contact-detail">
              <h3>Email</h3>

              <p>support@bidswift.com</p>
            </div>

            <div className="contact-detail">
              <h3>Phone</h3>

              <p>+91 98765 43210</p>
            </div>

            <div className="contact-detail">
              <h3>Working Hours</h3>

              <p>
                Monday - Friday
                <br />
                9:00 AM - 6:00 PM
              </p>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>

            <form
              className="contact-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="contact-form-group">
                <label htmlFor="contact-name">Name</label>

                <input
                  id="contact-name"
                  type="text"
                  placeholder="Enter your name"
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="contact-email">Email</label>

                <input
                  id="contact-email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="contact-message">Message</label>

                <textarea
                  id="contact-message"
                  rows="5"
                  placeholder="Enter your message"
                />
              </div>

              <button type="submit" className="contact-submit-button">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Contact;
