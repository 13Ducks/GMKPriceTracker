import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div className='app'>
            <Link to='/products/mizu/'>
                <button type="button">
                    GMK Mizu
            </button>
            </Link>

        </div>
    );
}

export default HomePage;