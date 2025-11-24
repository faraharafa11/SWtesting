import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <div className="home-hero-redesign">
      <div 
        className="home-hero-background"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.7)), url('/attached_assets/stock_images/gourmet_restaurant_f_dcb7e785.jpg')`
        }}
      >
        <div className="home-hero-content">
          <h1 className="hero-title">Experience Fine Dining</h1>
          <p className="hero-subtitle">Where Every Meal is a Masterpiece</p>
          <div className="cta-group">
            <Link className="btn-primary" to="/menu">
              View Menu
            </Link>
            <Link className="btn-ghost" to={isAuthenticated ? dashboardLink : '/auth/login'}>
              {isAuthenticated ? 'Book a Table' : 'Book a Table'}
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Gourmet Haven Section */}
      <section className="why-choose-section">
        <h2 className="section-title">Why Choose Gourmet Heaven</h2>
        <div className="why-choose-grid">
          <article className="why-choose-card">
            <div className="card-icon">👨‍🍳</div>
            <h3>Master Chefs</h3>
            <p>Our award-winning chefs create culinary masterpieces with the finest ingredients</p>
          </article>
          <article className="why-choose-card">
            <div className="card-icon">🍷</div>
            <h3>Drinks </h3>
            <p>Curated selection of premium drinks from around the world</p>
          </article>
          <article className="why-choose-card">
            <div className="card-icon">✨</div>
            <h3>Elegant Ambiance</h3>
            <p>Luxurious setting perfect for any special occasion</p>
          </article>
          <article className="why-choose-card">
            <div className="card-icon">⭐</div>
            <h3>5-Star Service</h3>
            <p>Exceptional service that exceeds expectations</p>
          </article>
        </div>
      </section>

      {/* Our Culinary Art Section */}
      <section className="culinary-art-section">
        <h2 className="section-title">Our Culinary Art</h2>
        <div className="culinary-grid">
          <div className="culinary-image">
            <img src="/attached_assets/stock_images/elegant_restaurant_d_23a19022.jpg" alt="Appetizer" />
          </div>
          <div className="culinary-image">
            <img src="/attached_assets/stock_images/gourmet_restaurant_f_07febe82.jpg" alt="Main Course" />
          </div>
          <div className="culinary-image">
            <img src="/attached_assets/stock_images/gourmet_restaurant_f_dd80290b.jpg" alt="Dining Experience" />
          </div>
          <div className="culinary-image">
            <img src="/attached_assets/stock_images/modern_restaurant_in_9f572029.jpg" alt="Restaurant Interior" />
          </div>
        </div>
      </section>
    </div>
  );
}
