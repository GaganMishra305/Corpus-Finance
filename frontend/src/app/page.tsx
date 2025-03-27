import Spline from '@splinetool/react-spline/next';

export default function Home() {
  return (
    <div>
        <div className="h-screen w-full bg-[#d5d5e4]">
            <div className='w-full flex items-start justify-center pt-6'>
                <h1 className='text-7xl font-extrabold text-center text-black uppercase font-mono'>
                    <span className='text-[#0096ee]'>C</span>orpus Finance</h1>
            </div>
            <div className='w-full flex items-center justify-center'>
                <Spline
                    scene="https://prod.spline.design/Q3P26U547-N9bxeJ/scene.splinecode"
                />
            </div>
        </div>
    </div>
  );
}
