import React from 'react'
import ChangePassWord from '../_components/changePassWord';
import { fetchJSON } from '@/lib/api';
import { USERSBYID_URL } from '@/actions/endpoint';

type Props = {
    params: {
        id: string
    }
}

async function page({ params }: Props) {
    // Await the params before accessing its properties
    const { id } = await params;
    
    const res = await fetchJSON(`${USERSBYID_URL}/${id}`)
    
    const userConnected = res.user
  

    return (
        <div>
            <ChangePassWord user={userConnected} />
        </div>
    )
}

export default page