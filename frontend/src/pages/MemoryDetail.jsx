import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Heart, MessageCircle, MoreHorizontal, Users } from "lucide-react";
import { memories } from "../data";

export default function MemoryDetail() {
  const { id } = useParams();
  const memory = memories.find((item) => item.id === Number(id)) ?? memories[0];

  return (
    <main className="phone-screen detail-screen">
      <section className="detail-photo">
        <img src={memory.cover} alt="" />
        <Link className="floating-action left" to="/timeline" aria-label="Back">
          <ChevronLeft size={21} />
        </Link>
        <button className="floating-action right" aria-label="More options">
          <MoreHorizontal size={21} />
        </button>
      </section>

      <section className="detail-panel">
        <div className="detail-heading">
          <div>
            <h1>{memory.title}</h1>
            <p>
              {memory.fullDate} - {memory.location}
            </p>
          </div>
          <button>Edit</button>
        </div>

        <p className="with-line">
          <Users size={16} />
          {memory.people}
        </p>

        <div className="detail-thumbs">
          {memory.photos.map((photo, index) => (
            <div className="detail-thumb" key={`${photo}-${index}`}>
              <img src={photo} alt="" />
              {index === memory.photos.length - 1 && <span>+{memory.count}</span>}
            </div>
          ))}
        </div>

        <p className="caption">Perfect weather and even better company.</p>

        <div className="social-row">
          <span>
            <Heart size={18} fill="currentColor" />
            Sarah and 12 others
          </span>
          <MessageCircle size={19} />
        </div>
      </section>
    </main>
  );
}
