
import React from 'react'
import Profile from './_components/profile'
import { fetchJSON } from '@/lib/api'
import { USERSBYID_URL } from '@/actions/endpoint'

type Props = {
    params :{
        id : string
    }
}
async function page({params}: Props) {
  
    const res = await fetchJSON(`${USERSBYID_URL}/${params.id}`)
    
    const userConnected = res.user
    

  return (
    <div>
        <Profile user={userConnected} />
    </div>
  )
}

export default page