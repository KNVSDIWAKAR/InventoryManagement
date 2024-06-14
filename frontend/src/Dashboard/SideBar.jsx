import React, { useContext } from 'react';
import { Sidebar } from 'flowbite-react';
import { BiBuoy } from 'react-icons/bi';
import { HiOutlineArrowSmRight, HiChartPie, HiOutlineChartPie, HiOutlineInbox, HiOutlineShoppingBag, HiOutlineTable, HiOutlineUser, HiViewBoards, HiOutlineCloudUpload } from 'react-icons/hi';

import { Link, useLocation } from 'react-router-dom';
import { FaBlog } from 'react-icons/fa6';
import '../home/BannerCard.css'
import './SideBar.css'


const SideBar = () => {
  
  const location = useLocation();

  return (
    <Sidebar aria-label="Sidebar with content separator example" className="bg-gradient-to-b from-blue-300 to-blue-600 h-screen">
      <div className="flex flex-col items-center p-8">
        <Link to="/" className='text-2xl font-bold text-blue-700 flex items-center gap-2' id='main'><FaBlog className='inline-block'  />InventIQ</Link>
        <br/>
        {/* <img src={profile.png} alt="userIMG" className="w-20 h-20 rounded-lg mb-2" /> */}
        <h4 className="text-blue-900 text-center mb-2 " style={{fontWeight: 'bold', fontSize:'25px'}}>Hello</h4>
        <h4 className='text-white' style={{fontWeight:'bold', fontSize:'20px', textAlign:'center'}}></h4>
      </div>

      <Sidebar.Items className="text-white">
        <Sidebar.ItemGroup>
          {/* <Sidebar.Item href="/admin/dashboard/dashboards" icon={HiOutlineChartPie} active={location.pathname === '/admin/dashboard'}>
            Dashboard
          </Sidebar.Item> */}
          <Sidebar.Item href="/admin/dashboard/upload" icon={HiOutlineCloudUpload} active={location.pathname === '/admin/dashboard/upload'}>
            Upload Products
          </Sidebar.Item>
          <Sidebar.Item href="/admin/dashboard/manage" icon={HiOutlineInbox} active={location.pathname === '/admin/dashboard/manage'}>
            Manage Product
          </Sidebar.Item>
        
          <Sidebar.Item href="/admin/dashboard/view-products" icon={HiOutlineShoppingBag} active={location.pathname === '/admin/dashboard/view-products'}>
            Products
          </Sidebar.Item>
          <Sidebar.Item href="/login" icon={HiOutlineArrowSmRight} active={location.pathname === '/sign-in'}>
            Sign In
          </Sidebar.Item>
          <Sidebar.Item href="/signout" icon={HiOutlineTable} active={location.pathname === '/logout'}>
            Log out
          </Sidebar.Item>
        </Sidebar.ItemGroup>

      </Sidebar.Items>
    </Sidebar>
  );
};
export  default SideBar;
