import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { NextPage } from 'next'
import * as React from 'react'
import { DownloadReport } from '../components/downloadReport'

const Home: NextPage = (props) => {
  return (
    <DownloadReport />
  )
}

export default Home;