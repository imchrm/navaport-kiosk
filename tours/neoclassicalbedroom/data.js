var APP_DATA = {
  "scenes": [
    {
      "id": "0-bedroom-left",
      "name": "Bedroom left",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.10944851510764053,
          "pitch": 0.5425434737009525,
          "rotation": 0,
          "target": "1-bedroom-center"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-bedroom-center",
      "name": "Bedroom center",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.6805790572444614,
          "pitch": 0.5467263157994608,
          "rotation": 6.283185307179586,
          "target": "0-bedroom-left"
        },
        {
          "yaw": 0.6719872383574401,
          "pitch": 0.5631276053947207,
          "rotation": 0,
          "target": "2-bedroom-right"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-bedroom-right",
      "name": "Bedroom right",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.13004273754780904,
          "pitch": 0.5625725742011873,
          "rotation": 0,
          "target": "1-bedroom-center"
        }
      ],
      "infoHotspots": []
    }
  ],
  "name": "Neoclassical bedroom by Polimesh",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": false,
    "fullscreenButton": true,
    "viewControlButtons": true
  }
};
