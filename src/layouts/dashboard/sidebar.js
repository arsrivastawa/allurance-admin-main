import React from 'react'

function sidebar() {
    return (
        <div>
            return (
            <nav className="side-menu">
                <ul>
                    <li>
                        <Link href="/">
                            <a>Home</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/about">
                            <a>About</a>
                        </Link>
                    </li>
                    <li>
                        <button onClick={toggleAccordion} className="accordion-btn">
                            Services
                        </button>
                        <ul className={`submenu ${isOpen ? 'open' : ''}`}>
                            <li>
                                <Link href="/services/service1">
                                    <a>Service 1</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/services/service2">
                                    <a>Service 2</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/services/service3">
                                    <a>Service 3</a>
                                </Link>
                            </li>
                        </ul>
                    </li>
                </ul>
                <style jsx>{`
        .side-menu {
          width: 200px;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        ul li {
          border-bottom: 1px solid #ddd;
        }
        ul li a {
          text-decoration: none;
          color: #333;
          display: block;
          padding: 10px;
        }
        .accordion-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px;
          width: 100%;
          text-align: left;
          outline: none;
        }
        .submenu {
          padding-left: 0;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        .submenu.open {
          max-height: 1000px; /* Adjust as needed */
        }
      `}</style>
            </nav>
            );


            export default useNavData;
        </div>
    )
}

export default sidebar