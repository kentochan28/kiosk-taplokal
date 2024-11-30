import { useRouter } from 'next/router';
import React from 'react';

const Page = () => {
    const router = useRouter();
    const orderno = router.query.orderno as string;
  return (
    <div className="text-center">
      <h1 className='mt-10 text-6xl font-bold mb-10'>Thank You For Your Purchase</h1>
      <p className='text-xl mb-5'>Please take note of your order number:</p>
      <h2 className='text-4xl font-bold my-5 uppercase text-foreground'>{orderno}</h2>
      <p className='text-xl mb-10'>and proceed to the counter to collect your order.</p>
      <div className='mt-10'>
        <p className='text-lg'>For any issues, please contact our staff.</p>
        <p className='text-lg'>Thank you for choosing us!</p>
      </div>
    </div>
  );
}

export default Page;
