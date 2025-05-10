import React from "react";
import "./Home.scss";
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/trustedBy/TrustedBy";
import Slide from "../../components/slide/Slide";
import CatCard from "../../components/catCard/CatCard";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { cards, projects } from "../../data";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <Featured />
      <TrustedBy />
      <Slide slidesToShow={5} arrowsScroll={5}>
        {cards.map((card) => (
          <CatCard key={card.id} card={card} />
        ))}
      </Slide>

      
        <div className="explore">
          <div className="container">
            <div className="items">
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Grafik%20&%20Desain">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/graphics-design.d32a2f8.svg"
                  alt="Grafik & Desain"
                /></a>
                <a href="/gigs?search=Grafik%20&%20Desain">
                <div className="line"></div></a>
                <a href="/gigs?search=Grafik%20&%20Desain">
                <span>Grafik & Desain</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Pemasaran%20Digital">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/online-marketing.74e221b.svg"
                  alt="Pemasaran Digital"
                /></a>
                <a href="/gigs?search=Pemasaran%20Digital">
                <div className="line"></div></a>
                <a href="/gigs?search=Pemasaran%20Digital">
                <span>Pemasaran Digital</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Penulisan%20&%20Penerjemahan">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/writing-translation.32ebe2e.svg"
                  alt="Penulisan & Penerjemahan"
                /></a>
                <a href="/gigs?search=Penulisan%20&%20Penerjemahan">
                <div className="line"></div></a>
                <a href="/gigs?search=Penulisan%20&%20Penerjemahan">
                <span>Penulisan & Penerjemahan</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Video%20&%20Animasi">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/video-animation.f0d9d71.svg"
                  alt="Video & Animasi"
                /></a>
                <a href="/gigs?search=Video%20&%20Animasi">
                <div className="line"></div></a>
                <a href="/gigs?search=Video%20&%20Animasi">
                <span>Video & Animasi</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Musik%20&%20Audio">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/music-audio.320af20.svg"
                  alt="Musik & Audio"
                /></a>
                <a href="/gigs?search=Musik%20&%20Audio">
                <div className="line"></div></a>
                <a href="/gigs?search=Musik%20&%20Audio">
                <span>Musik & Audio</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Pemrograman%20&%20Teknologi">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/programming.9362366.svg"
                  alt="Pemrograman & Teknologi"
                />
                </a>
                <a href="/gigs?search=Pemrograman%20&%20Teknologi">
                <div className="line"></div></a>
                <a href="/gigs?search=Pemrograman%20&%20Teknologi">
                <span>Pemrograman & Teknologi</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Bisnis">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/business.bbdf319.svg"
                  alt="Bisnis"
                />
                </a>
                <a href="/gigs?search=Bisnis">
                <div className="line"></div></a>
                <a href="/gigs?search=Bisnis">
                <span>Bisnis</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Gaya%20Hidup">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/lifestyle.745b575.svg"
                  alt="Gaya Hidup"
                />
                </a>
                <a href="/gigs?search=Gaya%20Hidup">
                <div className="line"></div></a>
                <a href="/gigs?search=Gaya%20Hidup">
                <span>Gaya Hidup</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
              <a href="/gigs?search=Data">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/data.718910f.svg"
                  alt="Data"
                /></a>
                <a href="/gigs?search=Data">
                <div className="line"></div>
                </a>
                <a href="/gigs?search=Data">
                <span>Data</span></a>
              </div>
              <div className="item">
              <span class="badge">Jasaverse</span>
                <a href="/gigs?search=Fotografi">
                <img
                  src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/photography.01cf943.svg"
                  alt="Fotografi"
                />
                </a>
                <a href="/gigs?search=Fotografi">
              <div className="line"></div>
              </a>
                <a href="/gigs?search=Fotografi">
                <span>Fotografi</span></a>
              </div>
            </div>
          </div>
        </div>
        <h2
  style={{
    fontSize: "2px",
    fontWeight: "bold",
    marginBottom: "7px",
    backgroundColor: "#f0f0f0", // Warna latar belakang
    
    textAlign: "center", // Teks di tengah
  }}
>

</h2>

        <div className="features dark">
  <div className="container">
    <div className="header">
      <h1>
        <img src="/img/trophy.png" alt="Trophy Icon" />
      </h1>
      <p>
        Temukan freelancer yang siap membantu berbagai kebutuhan proyek Anda, mulai dari desain, pengembangan, hingga pemasaran digital.
      </p>
    </div>

    <div className="feature-cards">
      <div className="card">
        <img src="./img/training.png" alt="Check Icon" />
        <h2>Temukan Keahlian yang Anda Butuhkan</h2>
        <p>
          Cari freelancer sesuai kebutuhan proyek Anda dengan berbagai keahlian yang tersedia.
        </p>
      </div>

      <div className="card">
        <img src="./img/logojasaverse4.png" alt="Check Icon" />
        <h2>Bergabung Sebagai Freelancer</h2>
        <p>
          Daftar dan tawarkan jasa Anda kepada klien yang mencari keahlian Anda.
        </p>
      </div>

      <div className="card">
        <img src="./img/task.png" alt="Check Icon" />
        <h2>Proyek yang Fleksibel</h2>
        <p>
          Pilih proyek sesuai keahlian dan waktu Anda untuk hasil yang optimal.
        </p>
      </div>
    </div>

    <div className="top-sellers">
    <h1>
        <img src="/img/trophy1.png" alt="Trophy Icon" />
      </h1>
      <h2>Jasaverse</h2>
      <p>Lihat bagan dengan peringkat teratas.</p>
      <a href="/seller-scores">
        <button className="explore-btn">Lihat Peringkat</button>
      </a>
    </div>
  </div>
</div>


<h2
  style={{
    fontSize: "2px",
    fontWeight: "bold",
    marginBottom: "7px",
    backgroundColor: "#f0f0f0", // Warna latar belakang
    
    textAlign: "center", // Teks di tengah
  }}
>

</h2>
<Slide slidesToShow={4} arrowsScroll={4}>
  {projects.map((card) => (
    <ProjectCard key={card.id} card={card} />
  ))}
</Slide>

    </div>
  );
}

export default Home;
