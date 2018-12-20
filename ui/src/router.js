import Vue from 'vue';
import Router from 'vue-router';
import Main from '@/views/Main';
import SignIn from '@/views/SignIn'
import DingDingSignIn from '@/views/DingDingSignIn'
import GetToken from '@/views/GetToken'

import Storages from '@/views/storages/Storages'
import CreateStorage from '@/views/storages/CreateStorage'
import UpdateStorage from '@/views/storages/UpdateStorage'
import StorageDrive from '@/views/storages/StorageDrive'
import Drives from '@/views/drives/Drives'
import Drive from '@/views/drives/Drive'
import Shares from '@/views/shares/Shares'
import Share from '@/views/shares/Share'
import Sharekey from '@/views/shares/Sharekey'
import PublicSharekey from '@/views/shares/PublicSharekey'

import Admins from '@/views/admins/Admins'
import Users from '@/views/users/Users'
import UserDrives from '@/views/users/UserDrives'
import UserDrive from '@/views/users/UserDrive'
import UserShares from '@/views/users/UserShares'
import UserShare from '@/views/users/UserShare'
import Mine from '@/views/mine/Mine'
import Docs from '@/views/docs/Docs'


Vue.use(Router);

var routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/dingding_signin/:appId',
    name: 'DingDingSignIn',
    component: DingDingSignIn,
  },
  {
    path: '/token',
    name: 'GetToken',
    component: GetToken,
  },
  {
    path: '/storages',
    name: 'Storages',
    component: Storages,
  },
  {
    path: '/storages_create',
    name: 'CreateStorage',
    component: CreateStorage,
  },
  {
    path: '/storages/:storageId',
    name: 'UpdateStorage',
    component: UpdateStorage,
  },
  {
    path: '/storages/:storageId/drives/:driveId',
    name: 'StorageDrive',
    component: StorageDrive,
  },
  {
    path: '/admins',
    name: 'Admins',
    component: Admins,
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path:'/users/:userId/drives',
    name: 'UserDrives',
    component: UserDrives
  },
  {
    path:'/users/:userId/drives/:driveId',
    name: 'UserDrive',
    component: UserDrive
  },
  {
    path:'/users/:userId/shares',
    name: 'UserShares',
    component: UserShares
  },
  {
    path:'/users/:userId/shares/:shareId',
    name: 'UserShare',
    component: UserShare
  },
  {
    path: '/drives',
    name: 'Drives',
    component: Drives,
  },
  {
    path: '/drives/:driveId',
    name: 'Drive',
    component: Drive,
  },
  {
    path: '/shares',
    name: 'Shares',
    component: Shares,
  },
  {
    path: '/shares/:shareId',
    name: 'Share',
    component: Share,
  },
  {
    path: '/sharekey/:sharekey',
    name: 'Sharekey',
    component: Sharekey,
  },
  {
    path: '/publicsharekey/:share_id/token/:access_token',
    name: 'PublicSharekey',
    component: PublicSharekey,
  },
  {
    path: '/mine',
    name: 'Mine',
    component: Mine,
  },
  {
    path: '/docs/:docPath',
    name: 'Docs',
    component: Docs,
  }
];


export default new Router({
  //mode: 'history',
  base: process.env.BASE_URL,
  routes: routes,
});
