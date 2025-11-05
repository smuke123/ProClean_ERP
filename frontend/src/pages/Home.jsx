import React from 'react';
import Banner from '../components/Banner';
import Category from '../components/Category';
import Offer from '../components/Offer';
import Arrived from '../components/Arrived';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Banner />
      <Category />
      <Offer />
      <Arrived />
    </div>
  );
}
