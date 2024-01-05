import { Team } from '@prisma/client';
import { GetServerSideProps } from 'next/types';
import { ParsedUrlQuery } from 'querystring';
import React from 'react'

type Props = {
  teams: Team[];
}

export default function profile ({ teams }: Props) {

  
  return (
    <> 
      <div>Test</div>
    </>
  )
}
