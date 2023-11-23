import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Body from './components/Body';
import Footer from './components/Footer';

import HomePage from './components/HomePage';
import SplashPage from './components/SplashPage';
import AccountingPage from './components/AccountingPage';
import CalculatorPage from './components/CalculatorPage';



function App() {
  return (
    <Router>
      <Switch>
        <Route path="/splash" component={SplashPage} />
        <Route path="/" component={HomePage} />
        <Route path="/accounting" component={AccountingPage} />
        <Route path="/calculator" component={CalculatorPage} />
      </Switch>
    </Router>
  );
}

export default App;
