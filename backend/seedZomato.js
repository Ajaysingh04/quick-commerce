import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Store from './models/Store.js';

const rawData = `Store Card
50% OFF

Apna Sweets
4.4
North Indian, Street Product, South Indian, Chinese, Pizza, Fast Product, Desserts, Beverages

₹150 for one

18 min

Store Card
50% OFF

Hotel Shreemaya
4.4
North Indian, Mughlai, Chinese, Continental, Desserts, Beverages

₹500 for one

43 min

Promoted
Store Card
50% OFF

KFC
4.1
Burger, Fast Product, Rolls

₹200 for one

23 min

Promoted
Store Card
₹60 OFF

Chai Thikana
4.2
Tea, Coffee, Shake, Beverages, Sandwich, Fast Product, Street Product

₹100 for one

25 min

Store Card
50% OFF

McDonald's
4.1
Burger, Fast Product, Beverages

₹200 for one

25 min

Promoted
Store Card
₹75 OFF

Jain Mithai Bhandar
4.2
Mithai, Street Product, Sandwich

₹100 for one

20 min

Store Card
50% OFF

Natural Ice Cream
4.5
Ice Cream

₹100 for one

15 min

Promoted
Store Card
50% OFF

Top N Town Ice Cream
4.2
Ice Cream, Kulfi

₹40 for one

15 min

Promoted
Store Card
30% OFF

Janta Kachori - SGSITS Wale
4.1
Street Product, Sandwich, Pizza, Fast Product, Shake, Beverages

₹100 for one

25 min

Store Card
₹120 OFF

Saify Hotel
3.9
North Indian

₹200 for one

18 min

Store Card
50% OFF

La Pino'z Pizza
4.2
Pizza, Italian, Fast Product, Mexican, Pasta

₹200 for one

28 min

Store Card
₹100 OFF

Domino's Pizza
4.1
Pizza, Italian, Pasta, Fast Product

₹200 for one

33 min

Store Card
50% OFF

Tinku's
4.2
Wraps, Sandwich, Pizza, Pasta, Fast Product, Coffee, Shake, Juices

₹200 for one

25 min

Store Card
50% OFF

Burger King
4.0
Burger

₹200 for one

20 min

Store Card
₹100 OFF

Gurukripa Store
4.1
North Indian, Chinese, Desserts, Beverages, Biryani

₹400 for one

25 min

Store Card
50% OFF

Pizza Hut
4.2
Pizza, Fast Product, Italian

₹200 for one

30 min

Store Card
₹100 OFF

The pizza Vodka
3.8
Pizza

₹200 for one

28 min

Store Card
50% OFF

The Belgian Waffle Co.
4.3
Waffle, Pancake, Ice Cream, Desserts, Beverages

₹150 for one

30 min

Store Card
₹100 OFF

99 Rotiwala
3.5
North Indian, Chinese, Kebab, Biryani, Beverages

₹150 for one

35 min

Store Card
₹75 OFF

Sam's Momos
4.1
Street Product, Chinese, Rolls, Momos, Shawarma, Beverages

₹200 for one

30 min

Store Card
₹150 OFF

Nafees Store
4.2
North Indian, Mughlai, Chinese, Kebab, Seaproduct, Biryani, Desserts, Beverages

₹400 for one

43 min

Store Card
MBA Thaliwalaa
3.8
Waffle, North Indian, Chinese

₹150 for one

28 min

Store Card
Burger Farm
4.2
Fast Product, Beverages

₹150 for one

29 min

Store Card
Rajhans Dal Bafle - Since 1975
4.3
North Indian

₹200 for one

15 min

Store Card
Oye24
3.9
North Indian, Street Product, Chinese, Fast Product, Pizza

₹200 for one

23 min

Store Card
Karnawat Bhojan Prasadi
4.1
North Indian, South Indian, Chinese, Sandwich, Pizza, Fast Product, Shake, Beverages

₹150 for one

24 min

Store Card
Shreemaya Celebration
4.3
North Indian, South Indian, Chinese, Continental, Fast Product, Beverages, Burger

₹350 for one

35 min

Store Card
Shree Leela Kitchen
4.1
North Indian, Chinese, Biryani, Desserts, Beverages

₹300 for one

24 min

Store Card
Hyderabadi Chicken Biryani Point
3.8
Biryani, North Indian, Fast Product

₹200 for one

20 min

Store Card
JMB
4.5
Mithai, North Indian, Chinese, Fast Product, Street Product

₹150 for one

23 min

Store Card
Vijay Shree Sandwich And Juice Center
4.2
Fast Product, Sandwich, Beverages, Shake, Pizza, Sichuan

₹150 for one

30 min

Store Card
Apna Ghar
3.8
North Indian, Street Product, Beverages

₹400 for one

30 min

Store Card
Namo Sandwich
4.1
Sandwich, Burger, Ice Cream, Beverages

₹200 for one

35 min

Store Card
₹100 OFF

Dutt Guru Kripa
4.3
North Indian, Chinese, Fast Product, Desserts, Beverages

₹350 for one

29 min

Store Card
₹75 OFF

Pandit Product Service
3.8
North Indian, Chinese, Rajasthani

₹100 for one

35 min

Store Card
₹100 OFF

Thali Company
3.6
North Indian

₹150 for one

34 min

Store Card
₹100 OFF

Chai Sutta Bar
3.7
Chinese, Burger, Coffee, Fast Product, Sandwich, Street Product

₹150 for one

25 min

Store Card
₹100 OFF

Nanaksar Dhaba
4.0
North Indian

₹150 for one

25 min

Store Card
₹75 OFF

Vijay Chaat House
4.5
Street Product, Mithai, Beverages

₹100 for one

15 min

Store Card
₹100 OFF

Jain Momos
4.3
Momos

₹100 for one

28 min

Store Card
₹100 OFF

Dev's Bakery
4.3
Bakery

₹150 for one

20 min

Store Card
₹100 OFF

Hatims Kebabs And Biryani Corner
4.0
North Indian, Biryani, Kebab, Shawarma

₹150 for one

25 min

Store Card
₹100 OFF

Kolkata Roll Chinese Chaska 56 Dukan
4.2
Rolls, Fast Product, Chinese, Sichuan

₹100 for one

28 min

Store Card
₹100 OFF

Yummy Shree Sandwich
4.2
Fast Product, Street Product, Beverages, Sandwich, Sichuan

₹100 for one

30 min

Store Card
50% OFF

Pizza Nest
4.2
Pizza, Burger, Sandwich, Fast Product

₹100 for one

30 min

Store Card
₹100 OFF

Mota Bhaii Indian Kitchen
4.3
North Indian, Chinese, Street Product

₹200 for one

30 min

Store Card
50% OFF

RollsKing
4.2
Rolls, Fast Product

₹150 for one

30 min

Store Card
₹100 OFF

HTL Cafe - Hum Tum Aur Lamhe
4.0
Burger, Cafe, Coffee, Fast Product, Pasta, Pizza, Sandwich

₹250 for one

43 min

Store Card
₹100 OFF

Johny Hot Dog
4.4
Fast Product, Hot dogs, Street Product

₹100 for one

23 min

Store Card
₹100 OFF

Dr. Joos Cafe
4.1
Wraps, Street Product, Sandwich, Juices, Burger, Momos

₹200 for one

29 min

Store Card
₹60 OFF

DB Chinese
3.8
Chinese, South Indian, Fast Product

₹100 for one

24 min

Store Card
₹100 OFF

Theobroma
4.3
Bakery

₹200 for one

18 min

Store Card
₹100 OFF

Sams Momos And Rolls
3.9
Street Product, Sandwich, Chinese

₹150 for one

25 min

Store Card
50% OFF

Shiva Chinese Wok
4.1
Chinese, Fast Product, Pasta, Thai, Indo-Chinese

₹200 for one

30 min

Store Card
₹120 OFF

Tea Bar Pocket Cafe
4.0
Tea, Chinese, Burger, Sandwich, Pizza, Momos, Street Product, Shake

₹150 for one

33 min

Store Card
₹100 OFF

Ice Balls & Slice Square
4.3
Sandwich, Fast Product

₹100 for one

25 min

Store Card
₹100 OFF

Vijayshree Sandwich
4.3
Sandwich, Pizza, Burger, Fast Product, Street Product, Juices, Shake, Beverages

₹100 for one

24 min

Store Card
₹120 OFF

Martino'z Pizza
4.0
Pizza, Fast Product, Mexican

₹200 for one

30 min

Store Card
50% OFF

Om Namkeen
4.5
Street Product

₹100 for one

20 min

Store Card
50% OFF

The Waffle Co.
3.6
Waffle

₹300 for one

35 min

Store Card
50% OFF

The Pizza Project By Oven Story
4.1
Pizza

₹100 for one

35 min

Store Card
50% OFF

Keventers - Milkshakes & Waffles
4.0
Shake, Beverages, Desserts

₹200 for one

30 min

Store Card
50% OFF

Pijjo
4.0
Pizza, Burger, Sandwich, Street Product, Waffle, Beverages

₹100 for one

30 min

Store Card
₹120 OFF

Pishori Store
4.2
North Indian, Mughlai, Kebab, Biryani, Chinese, Seaproduct

₹400 for one

30 min

Store Card
50% OFF

Fantasy Bakery & Cafe
4.3
Cafe, Coffee, Beverages, Fast Product, Continental, North Indian, Chinese, Bakery

₹400 for one

28 min

Store Card
50% OFF

Behrouz Biryani
4.3
Biryani, Kebab, North Indian

₹300 for one

28 min

Store Card
50% OFF

Subway
3.9
Healthy Product, Sandwich, Fast Product, Wraps, Salad, Beverages

₹200 for one

23 min

Store Card
₹60 OFF

Biryani On Wheels
3.4
Biryani, North Indian, Mughlai

₹150 for one

20 min

Store Card
50% OFF

Granny's Thaliwala
3.7
North Indian, Street Product, Chinese

₹200 for one

28 min

Store Card
Frullato
4.3
Shake, Beverages

₹150 for one

24 min

Store Card
JMB - Jain Mithai Bhandar
4.0
Mithai, North Indian, South Indian, Chinese, Sandwich, Fast Product, Street Product, Beverages

₹200 for one

20 min

Store Card
Bhartiya Dal Bafala
4.0
North Indian

₹100 for one

15 min

Store Card
Guru Ji Khalsa Dhaba
3.6
North Indian, Chinese

₹100 for one

25 min

Store Card
The Coffee Concept
4.1
Cafe, Coffee, North Indian, Fast Product, Sandwich, Chinese, Shake, Beverages

₹300 for one

23 min

Store Card
The Krishnam Cafe
3.8
South Indian, Chinese, Sandwich, Pizza, Burger, Shake, Momos, Beverages

₹150 for one

30 min

Store Card
Frutful
4.3
Healthy Product, Salad, Juices

₹200 for one

33 min

Store Card
Dream Pizza
3.5
Pizza, Fast Product, Street Product, Shake

₹100 for one

46 min

Store Card
99 Rotiwala LIG
4.0
North Indian

₹200 for one

35 min

Store Card
BJT Ke Samose Store
4.2
North Indian, Burger, Sandwich, Beverages, Pasta, Pizza, Street Product, Fast Product

₹100 for one

25 min

Store Card
Faasos - Wraps, Rolls & Shawarma
4.2
Rolls, Wraps, Shawarma

₹200 for one

30 min

Store Card
Maharaja Kachori Corner
4.2
Street Product

₹40 for one

15 min

Store Card
Shawarma Grill & Momo Station
3.9
Shawarma, Fast Product, Momos, Lebanese, Rolls, Beverages

₹150 for one

45 min

Store Card
Vinay Hotel
3.9
North Indian, Mughlai, Seaproduct

₹200 for one

18 min

Store Card
Dawar Store
3.5
North Indian, Chinese

₹150 for one

28 min

Store Card
WOW! Momo
4.0
Momos, Chinese, Fast Product, Asian, Beverages

₹150 for one

25 min

Store Card
TeaFlix - The Mood Changer
4.0
Beverages, Cafe, Fast Product, Tea, American, Chinese, Italian, Street Product

₹100 for one

41 min

Store Card
Pizza History
3.9
Pizza, Fast Product, Chinese

₹150 for one

35 min

Store Card
Baskin Robbins - Ice Cream Desserts
4.2
Ice Cream, Desserts, Shake, Beverages

₹200 for one

19 min

Store Card
Mumbai Vada Pav
4.2
Street Product

₹100 for one

23 min

Store Card
Mahadev Store
4.3
North Indian, Chinese, Street Product, Desserts

₹150 for one

14 min

Store Card
Nema Kulfi and Gajak 56 Dukan
4.2
Ice Cream, Desserts, Shake, North Indian, South Indian

₹40 for one

23 min

Store Card
Olio - The Wood Fired Pizzeria
4.1
Pizza

₹100 for one

30 min

Store Card
Shree Nakoda Dham Bhojnalay
4.4
North Indian

₹100 for one

20 min

Store Card
₹100 OFF

The New York Pizza
3.7
Pizza, Burger, Fast Product, Beverages, Waffle

₹200 for one

35 min

Store Card
₹100 OFF

Indian Coffee House
4.3
South Indian, North Indian, Chinese, Beverages

₹200 for one

30 min

Store Card
₹75 OFF

New Agrawal Sweets
4.1
Street Product

₹150 for one

20 min

Store Card
₹100 OFF

Thalaiva Biryani
4.2
Biryani

for one

30 min

Store Card
₹100 OFF

Mumbai Vada Pav
4.1
Maharashtrian, Street Product, Fast Product, Beverages

₹100 for one

19 min

Store Card
₹120 OFF

Eibaa's Kitchen
4.1
North Indian, Mughlai, Biryani, Seaproduct

₹250 for one

25 min

Store Card
₹100 OFF

Agrawal Sweets
4.4
Mithai, Desserts

₹100 for one

13 min

Store Card
₹100 OFF

Chick-N-Serve
4.1
Fast Product, Lebanese, Arabic

₹200 for one

24 min

Store Card
₹75 OFF

Chai Story
4.0
Tea, Fast Product, Indo-Chinese

₹100 for one

30 min

Store Card
₹60 OFF

G9 Dhaba And Store
3.7
Street Product, North Indian

₹150 for one

39 min

Store Card
₹100 OFF

Oven Story Pizza
4.4
Pizza, Italian, Pasta

₹250 for one

39 min

Store Card
₹60 OFF

Chinese King
3.8
Chinese, South Indian

₹150 for one

25 min

Store Card
50% OFF

Chinese History
4.0
Chinese, Sichuan

₹150 for one

40 min

Store Card
50% OFF

Pizzashot
3.7
Burger, Fast Product, Pasta, Pizza, Beverages, Street Product

₹150 for one

30 min

Store Card
₹60 OFF

Bapu Ki Kutia
4.0
North Indian, Street Product

₹400 for one

30 min

Store Card
50% OFF

Rasgulla House
4.4
Mithai

₹40 for one

20 min

Store Card
₹75 OFF

Idli Hut
4.2
South Indian, Chinese, Fast Product, Street Product, Shake, Beverages

₹200 for one

25 min

Store Card
50% OFF

Hungry Den
4.1
Sandwich, Fast Product, Momos, Street Product, Shake

₹100 for one

40 min

Store Card
50% OFF

Shreemaya Bakery
4.5
Bakery, Desserts

₹150 for one

19 min

Store Card
₹75 OFF

NBC - Nothing Before Coffee
4.1
Cafe, Coffee, Beverages, Street Product, Desserts

₹200 for one

30 min

Store Card
50% OFF

Shree RajaRam Dhaba
4.2
North Indian

₹100 for one

24 min

Store Card
₹100 OFF

Ashirwad Hotel
4.0
North Indian

₹150 for one

41 min

Store Card
50% OFF

Sweet Truth - Cake and Desserts
4.3
Desserts, Bakery, Ice Cream

₹250 for one

24 min

Store Card
50% OFF

Ravi Alpahar
4.3
Street Product, Fast Product

₹150 for one

14 min

Store Card
La Berry Patisserie
4.2
Bakery, Desserts

₹250 for one

19 min

Store Card
Shyam Sandwich
4.0
North Indian, Street Product, Fast Product, Beverages

₹150 for one

25 min

Store Card
Upper Deck Cafe
3.7
Chinese, Pizza, Sandwich

₹150 for one

33 min

Store Card
WOW! Chicken by WOW! Momo
3.8
Burger, American, Fast Product

₹200 for one

29 min

Store Card
Four Buddies Cafe
4.1
Pizza, Burger, Fast Product, Street Product

₹100 for one

35 min

Store Card
Dabba & Co
4.0
North Indian

for one

25 min

Store Card
Cafe Udipi
4.2
South Indian

₹200 for one

20 min

Store Card
Shree Leela Hotdog
4.4
Street Product, Sandwich

₹100 for one

18 min

Store Card
Cafe J3 - Jain Jinvani Junction
3.6
Pizza, Sandwich, Burger, Fast Product, Street Product, Coffee, Shake, Beverages

₹200 for one

43 min

Store Card
99 Chickenwala
3.5
North Indian

₹100 for one

23 min

Store Card
Shyam Sandwich
4.1
Sandwich, Pizza, Burger, Fast Product, Street Product, Chinese, Beverages

₹200 for one

25 min

Store Card
Bholenath Vadapav
4.3
Street Product

₹100 for one

24 min

Store Card
₹100 OFF

Gulzar Store
4.2
North Indian, Mughlai

₹200 for one

23 min

Store Card
₹100 OFF

House Of Biryani
3.6
Biryani, North Indian, Kebab

₹300 for one

25 min

Store Card
50% OFF

Kabhi B - Bakery & Cafe
4.1
Bakery, Desserts, Fast Product, Street Product, Beverages

₹350 for one

24 min

Store Card
₹60 OFF

MH Burger House
3.8
Burger, Fast Product

₹150 for one

29 min

Store Card
₹100 OFF

South Udupi
4.1
South Indian, Pizza, Sandwich, Street Product, Beverages

₹100 for one

25 min

Store Card
₹100 OFF

The Biryani Life
4.1
Biryani, Mughlai

₹200 for one

30 min

Store Card
₹100 OFF

Frullato
4.3
Shake

₹100 for one

30 min

Store Card
₹100 OFF

Cakes 365
4.1
Bakery, Fast Product, Street Product, Shake, Coffee

₹150 for one

25 min

Store Card
₹100 OFF

Mahakal Chat Corner
4.0
Street Product

₹40 for one

15 min

Store Card
₹100 OFF

Veg Legacy
3.9
North Indian, Chinese, Fast Product

₹150 for one

30 min

Store Card
₹100 OFF

Monu Gyaniji Ka Dhaba
4.0
North Indian, Chinese, Fast Product, Desserts, Beverages

₹150 for one

30 min

Store Card
₹100 OFF

Top N Town Ice Cream
4.3
Ice Cream, Desserts

₹150 for one

20 min

Store Card
50% OFF

99 Parathas
3.6
North Indian, Biryani, Chinese, Sandwich, Street Product

₹100 for one

30 min

Store Card
50% OFF

Zuby's Fast 'N' Productious
4.3
Fast Product, Burger, Sandwich, Beverages

₹200 for one

30 min

Store Card
50% OFF

Cakes N Craft
4.2
Bakery, Desserts

₹200 for one

20 min

Store Card
50% OFF

Shahi Khaman - Jalaram Farsan
4.3
Street Product, Gujarati

₹100 for one

15 min

Store Card
50% OFF

Prashant Nashta Corner
4.2
North Indian, South Indian, Street Product, Desserts, Beverages

₹100 for one

20 min

Store Card
₹75 OFF

Just Paratha
4.1
North Indian, Fast Product, Shake

₹150 for one

35 min

Store Card
₹100 OFF

Tealogy
4.0
Tea, Coffee, Shake, Beverages, Sandwich, Pizza, Burger, Cafe

₹100 for one

35 min

Store Card
50% OFF

Kolkata Roll - Chiniese Product
4.0
Rolls, Chinese, Biryani, Shawarma, Sichuan, Momos, Fast Product

₹150 for one

28 min

Store Card
50% OFF

Burger Maker World
4.0
Burger, Fast Product, Sandwich, Chinese, North Indian, Pizza, Bakery, Beverages

₹200 for one

43 min

Store Card
₹60 OFF

Young Tarang
3.9
North Indian, Street Product, Chinese, Pizza, Sandwich, Fast Product, Ice Cream

₹150 for one

28 min

Store Card
₹100 OFF

Guru Store
3.7
North Indian

₹100 for one

25 min

Store Card
₹100 OFF

The Pizza Paradise
4.2
Pizza

₹150 for one

34 min

Store Card
₹100 OFF

Royal Thaliwala
3.7
North Indian, Chinese

₹200 for one

23 min

Store Card
₹100 OFF

Cafe Aroma White
3.8
Street Product, Pizza, Cafe, Coffee, Sandwich, Fast Product, Desserts

₹400 for one

30 min

Store Card
₹100 OFF

Hungry Den Store
4.0
Sandwich, Burger, Fast Product, Street Product, Momos, Shake

₹150 for one

41 min

Store Card
₹100 OFF

Jain Shree Sweets
3.9
Mithai, North Indian, Street Product

₹100 for one

20 min

Store Card
₹60 OFF

Bansuriwala
3.6
North Indian, Chinese, Fast Product

₹150 for one

29 min

Store Card
₹60 OFF

Bombay Chinese Family Store
4.2
Chinese, Sichuan, Momos, Pasta, Street Product

₹150 for one

25 min

Store Card
₹100 OFF

Hotel Apna Avenue
4.2
North Indian, South Indian, Chinese, Fast Product, Desserts, Beverages

₹400 for one

20 min

Store Card
50% OFF

OVENLY By Khurana's - Since 1991
4.2
Bakery, Desserts, Sandwich, Pizza, Fast Product, Shake

₹200 for one

20 min

Store Card
₹100 OFF

Raju Hotel
3.8
North Indian

₹100 for one

28 min

Store Card
50% OFF

Veer Ji Malai Chaap Wale
4.1
North Indian, Biryani, Chinese, Burger, Rolls, Momos, Shake, Beverages

₹250 for one

34 min

Store Card
50% OFF

Chaileela
4.2
Chinese, Tea, Beverages, North Indian, Sandwich, Pizza, Fast Product, Burger

₹150 for one

35 min

Store Card
₹100 OFF

3 Mom's Kitchen
4.2
North Indian

₹100 for one

30 min

Store Card
₹100 OFF

Dal Bati Surma
4.2
Rajasthani

₹250 for one

30 min

Store Card
₹100 OFF

Sanwariya Falhari And Classic Sandwich
4.0
Fast Product, Sandwich, Street Product

₹100 for one

25 min

Store Card
₹60 OFF

Shanu Sandwich And Shakes
4.0
Sandwich, Shake

₹100 for one

30 min

Store Card
₹100 OFF

Ramesh South Indian
4.1
South Indian

₹150 for one

25 min

Store Card
₹100 OFF

Jhansi Darbar
3.8
Biryani, North Indian, Street Product

₹100 for one

40 min

Store Card
₹75 OFF

Upvaas
4.1
Desserts, North Indian, Street Product

₹100 for one

23 min

Store Card
₹100 OFF

Lunchbox - Meals & Thalis
4.2
North Indian, Biryani, Mughlai

₹150 for one

30 min

Store Card
₹100 OFF

Pizza 99
3.5
Burger, Pizza, Pasta

₹200 for one

30 min

Store Card
₹60 OFF

Atithi Pure Veg Store
3.6
North Indian, Chinese, Fast Product, Street Product, Sandwich, Shake

₹200 for one

34 min

Store Card
₹60 OFF

Karnawat Pan Bhojan Prasadi Chat Chaupati
4.3
North Indian, Chinese, South Indian

₹150 for one

20 min

Store Card
₹100 OFF

The Vada Pav House
4.1
Street Product, Beverages

₹40 for one

20 min

Store Card
₹60 OFF

Chai Biskut Cafe
3.8
Street Product, Fast Product, Beverages

₹100 for one`;

const images = {
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'North Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  'South Indian': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
  'Chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  'Desserts': 'https://images.unsplash.com/photo-1551024506-0cb4a1c5d3ea?auto=format&fit=crop&w=800&q=80',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'Street Product': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
  'Ice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  'Mithai': 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&w=800&q=80',
  'Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  'Rolls': 'https://images.unsplash.com/photo-1626804475297-41609ea0eb49?auto=format&fit=crop&w=800&q=80',
  'Tea': 'https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?auto=format&fit=crop&w=800&q=80',
  'Coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
  'Healthy Product': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
  'Fast Product': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  'Waffle': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
  'Momos': 'https://images.unsplash.com/photo-1626779872583-66f8e7529324?auto=format&fit=crop&w=800&q=80',
  'Sichuan': 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=800&q=80',
  'Italian': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  'Mexican': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  'Thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80',
  'Mughlai': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  'Seaproduct': 'https://images.unsplash.com/photo-1615141982883-c7da0e698800?auto=format&fit=crop&w=800&q=80',
  'Default': 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=80'
};

function getImageForCuisines(cuisines) {
  for (const cuisine of cuisines) {
    if (images[cuisine.trim()]) {
      return images[cuisine.trim()];
    }
  }
  return images['Default'];
}

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Parse the raw data
    const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const stores = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^\d\.\d$/)) {
        // Found a rating, which means the line above is the store name
        const rating = parseFloat(lines[i]);
        let name = lines[i - 1];
        
        const cuisines = lines[i + 1].split(',').map(c => c.trim());
        
        let costForTwo = 300; // default
        let j = i + 2;
        while (j < lines.length && !lines[j].includes('min') && !lines[j].match(/^\d\.\d$/)) {
          if (lines[j].includes('₹')) {
            const match = lines[j].match(/\d+/);
            if (match) {
              costForTwo = parseInt(match[0]) * 2; // "price for one" -> * 2
            }
          }
          j++;
        }
        
        let deliveryTime = 30; // default
        let searchJ = i + 2;
        while (searchJ < lines.length && !lines[searchJ].match(/^\d\.\d$/)) {
           if (lines[searchJ].includes('min')) {
             const match = lines[searchJ].match(/\d+/);
             if (match) {
               deliveryTime = parseInt(match[0]);
               break;
             }
           }
           searchJ++;
        }
        
        const bannerImage = getImageForCuisines(cuisines);

        stores.push({
          name,
          description: cuisines.join(' • '),
          bannerImage,
          cuisineTypes: cuisines,
          rating,
          reviewsCount: Math.floor(Math.random() * 500) + 50,
          deliveryTime,
          distance: parseFloat((Math.random() * 5 + 1).toFixed(1)),
          costForTwo,
          isActive: true,
          featured: Math.random() > 0.8
        });
      }
    }

    console.log(`Parsed ${stores.length} stores.`);
    
    // Insert without deleting old ones
    await Store.insertMany(stores);
    console.log('Successfully seeded database!');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
