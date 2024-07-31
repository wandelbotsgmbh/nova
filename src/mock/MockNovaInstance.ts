import { InternalAxiosRequestConfig, AxiosResponse } from "axios"
import type { AutoReconnectingWebsocket } from "../lib/AutoReconnectingWebsocket"
import * as pathToRegexp from "path-to-regexp"
import {
  ControllerInstanceList,
  MotionGroupStateResponse,
} from "@wandelbots/wandelbots-api-client"

/**
 * EXPERIMENTAL
 * Ultra-simplified mock Nova server for testing stuff
 */
export class MockNovaInstance {
  readonly connections: AutoReconnectingWebsocket[] = []

  constructor() {
    console.log("Mock websocket server created")
  }

  async handleAPIRequest(
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const apiHandlers = [
      {
        method: "GET",
        path: "/cells/:cellId/controllers",
        handle(config: InternalAxiosRequestConfig) {
          return {
            status: 200,
            statusText: "Success",
            data: JSON.stringify({
              instances: [
                {
                  controller: "mock-ur5e",
                  model_name: "UniversalRobots::Controller",
                  host: "mock-ur5e",
                  allow_software_install_on_controller: true,
                  physical_motion_groups: [
                    {
                      motion_group: "0@mock-ur5e",
                      name_from_controller: "UR5e",
                      active: false,
                      model_from_controller: "UniversalRobots_UR5e",
                    },
                  ],
                  has_error: false,
                  error_details: "",
                },
              ],
            } satisfies ControllerInstanceList),
            headers: {},
            config,
            request: {
              responseURL: config.url,
            },
          }
        },
      },
    ]

    const path = "/cells" + config.url?.split("/cells")[1]

    for (const handler of apiHandlers) {
      const match = pathToRegexp.match(handler.path)(path || "")
      if (config.method?.toUpperCase() === handler.method && match) {
        return handler.handle(config)
      }
    }

    return {
      status: 404,
      statusText: "Not Found",
      data: "",
      headers: {},
      config,
      request: {
        responseURL: config.url,
      },
    }
  }

  handleWebsocketConnection(socket: AutoReconnectingWebsocket) {
    this.connections.push(socket)

    setTimeout(() => {
      socket.dispatchEvent(new Event("open"))

      console.log("Websocket connection opened from", socket.url)

      if (socket.url.endsWith("/state-stream")) {
        socket.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify(defaultMotionState),
          }),
        )
      }
    }, 10)
  }

  handleWebsocketMessage(socket: AutoReconnectingWebsocket, message: string) {
    console.log(`Received message on ${socket.url}`, message)
  }
}

const defaultMotionState = {
  result: {
    state: {
      motion_group: "0@universalrobots-ur5e",
      controller: "universalrobots-ur5e",
      joint_position: {
        joints: [
          1.1699999570846558, -1.5700000524520874, 1.3600000143051147,
          1.0299999713897705, 1.2899999618530273, 1.2799999713897705,
        ],
      },
      joint_velocity: {
        joints: [0, 0, 0, 0, 0, 0],
      },
      flange_pose: {
        position: {
          x: 1.3300010259703043,
          y: -409.2680714682808,
          z: 531.0203477065281,
        },
        orientation: {
          x: 1.7564919306270736,
          y: -1.7542521568325058,
          z: 0.7326972590614671,
        },
        coordinate_system: "",
      },
      tcp_pose: {
        position: {
          x: 1.3300010259703043,
          y: -409.2680714682808,
          z: 531.0203477065281,
        },
        orientation: {
          x: 1.7564919306270736,
          y: -1.7542521568325058,
          z: 0.7326972590614671,
        },
        coordinate_system: "",
        tcp: "Flange",
      },
      velocity: {
        linear: {
          x: 0,
          y: 0,
          z: 0,
        },
        angular: {
          x: 0,
          y: 0,
          z: 0,
        },
        coordinate_system: "",
      },
      force: {
        force: {
          x: 0,
          y: 0,
          z: 0,
        },
        moment: {
          x: 0,
          y: 0,
          z: 0,
        },
        coordinate_system: "",
      },
      joint_limit_reached: {
        limit_reached: [false, false, false, false, false, false],
      },
      joint_current: {
        joints: [0, 0, 0, 0, 0, 0],
      },
    },
  } satisfies MotionGroupStateResponse,
}
