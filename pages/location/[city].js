import React from 'react';
import cities from '../../lib/city.list.json';
import Head from 'next/head';
import TodayWeather from '../../components/TodayWeather';
import moment from 'moment-timezone';
import HourlyWeather from '../../components/HourlyWeather';
import WeeklyWeather from '../../components/WeeklyWeather';
import SearchBox from '../../components/SearchBox';
import Link from 'next/link';

export async function getServerSideProps(context) {
  const city = getCityId(context.params.city);

  if(!city) {
    return { notFound: true,};
  } 

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${process.env.API_KEY}&exclude=minutely&units=metric`
    );
  const data = await res.json();
  if(!data){
    return {
      notFound: true,
    };
  }
  
  const hourlyWeather = getHourlyWeather(data.hourly, data.timezone);
  const weeklyWeather = data.daily;

  return {
    props : {
      city: city,
      timezone: data.timezone,
      currentWeather: data.current,
      hourlyWeather: hourlyWeather,
      weeklyWeather: weeklyWeather,
    },
  };
}

const getCityId = (param) => {
  const cityParam = param.trim();
  //get the id of the city
  const split = cityParam.split("-");
  const id = split[split.length - 1];

  if(!id) {
    return null;
  }

  const city = cities.find(city => city.id.toString() == id);
  if(city) {
    return city;
  }else{
    return null;
  }
}

const getHourlyWeather = (hourlyData, timezone) => {
  const dayEnd = moment().tz(timezone).endOf('day').valueOf();
  const endTimeStamp = Math.floor( dayEnd /1000);

  const todayData = hourlyData.filter((data) => data.dt < endTimeStamp);
  return todayData;
}

export default function City({ city, currentWeather, weeklyWeather, hourlyWeather, timezone }) {
  return (
  <div>
    <Head>
      <title>{city.name} Weather - Next JS</title>
    </Head>

    <div className="page-wrapper">
      <div className="container">
        <Link href="/">
          <a className="back-link">&larr; Home</a>
        </Link>
        <SearchBox placeholder='Search for location...'/>
        <TodayWeather 
        city={city} 
        weather={weeklyWeather[0]} 
        timezone={timezone} />

        <HourlyWeather 
        hourlyWeather={hourlyWeather}
        timezone={timezone}
        />

        <WeeklyWeather 
        weeklyWeather={weeklyWeather}
        timezone={timezone}
        />

      </div>
    </div>
  </div>
  );
}
