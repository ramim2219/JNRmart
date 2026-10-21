import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
export default function Breadcrumb({items=[]}) {
  return <nav className="breadcrumbs container" aria-label="Breadcrumb"><Link to="/"><Home size={15}/> Home</Link>{items.map((item,i)=><span key={`${item.label}-${i}`} className="crumb"><ChevronRight size={14}/>{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
