# Room usage application

<!-- This a React + Typescript web application using Vite.
It lets users upload their room own usage data and lets them interact with charts. -->

Web application that lets users view statistics on the time spent on various rooms of a house.
A new user can signup and upload a file containing the data of the usage of various rooms in a time period,
this data will then be saved into a Supabase database used to render various interactive charts for the time spent in each room in the dataset.

## Built with:

-   [![Node][nodejs]](https://nodejs.org/en)

-   [![React][react]](https://react.dev/)

-   [![Vite][vite]](https://vite.dev/)

-   [![Bootstrap][bootstrap]](https://getbootstrap.com/)

-   [![Supabase][supabase]](https://supabase.com/)

## Requirements

To run this application you need first install:

1. **NodeJS** version 20.x or superior; it includes npm (Node Packet Manager) to install dependencies.
2. **Git** to clone the repo from github.

### On Windows

-   Install Nodejs from the website [nodejs.org](https://nodejs.org/en) selecting a LTS (Long Term Support) version and follow the installer.
-   Install Git from the website [gitscm.com](https://git-scm.com/downloads) and follow the installer selecting the default configurations.

-   To verify the installation open a command prompt window (cmd) and run

    > git --version

    > node --version

    > npm --version

### On Ubuntu

-   Open a terminal and update system

    > sudo apt update

    > sudo apt upgrade

-   Install Node and npm

    > sudo apt install -y nodejs npm

-   Install Git

    > sudo apt install -y git

-   Verify the installation:

    > git --version

    > node -v

    > npm -v

## Download and install application

After making sure both git and node are installed you can procede to download the project from the github repo.

-   Open the command prompt (on Windows) or a terminal (on Ubuntu)
-   Navigate to the directory you want to install the the project
-   Run

    > git clone https://github.com/piccolidavide/RoomHours.git

-   Navigate to the project directory

    > cd RoomHours

-   Install dependencies

    > npm install

-   This will install all the dependencies needed to run the application.

    You can now run the project:

    > npm run dev

    Open the browser and navigate to the address shown in the console (usually http://localhost:5173/)

## Database setup

Right now you can run the project but you won't be able to use it fully since you need to use supabase for the database.

-   Create an **.env** file in the root directory of the project with two variables

    > VITE_SUPABASE_URL=

    > VITE_SUPABASE_ANON_KEY=

-   Head to [supabase](https://supabase.com/) website and create a free account, and create a new project.

    Open the project on the website and on the left side of the screen click on **Project settings** and again on _Data API_

    Copy the project URL and paste it in the env variable

         VITE_SUPABASE_URL= your_project_url

    Then click on _API Keys_ and copy the value of the _anon public_ key, paste it in env

        VITE_SUPABASE_ANON_KEY= your_anon_key

-   Open the sql editor and paste the sql script saved in the file **schema.sql**

    Run the script and it will create all the tables and policies needed to use the application.

## Usage

After creating your account you will be redirected to the home page where you can upload your data.

The application accepts 2 types of input files:

1. **csv**
2. **json**

### csv file

The csv file must have this type of header:

    > Timestamp,room1,room2,...,roomN

and the data should be in the form:

    2024-01-01 00:00:18,0,0,...,0
    2024-01-01 00:01:18,0,0,...,1
    2024-01-01 00:02:07,1,0,...,0
    2024-01-01 00:03:35,0,0,...,1
    2024-01-01 00:04:17,1,0,...,0

where 1 indicates presence in a room for that timestamp (only one presence per row is required).

### json file

The json file should be an array of object with structure:

    [
        {
            "Timestamp": "2024-01-01 00:00:18",
            "Rooms": {
                "room1": 1,
                "room2": 0,
                ...
                "roomN": 0
            }
        },
        ...
    ]

<!-- Shields -->

[nodejs]: https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white
[react]: https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge
[vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white
[bootstrap]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
