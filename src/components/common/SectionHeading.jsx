import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
export default function SectionHeading({title,subtitle,to}){return <div className="section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{to && <Link to={to}>View all <ArrowRight size={16}/></Link>}</div>}
