import React from 'react'

const Rank = ({ name, entries }) => (
  <div>
    <div className='white f3'>
      Welcome {name}, your current entry count is...
    </div>
    <div className='white f1'>{entries}</div>
  </div>
)

export default Rank
