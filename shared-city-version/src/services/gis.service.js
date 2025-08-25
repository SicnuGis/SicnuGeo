
// 以下是一个简单的 GIS 服务示例代码，包含获取地图数据和计算两点距离的功能

/**
 * 模拟从服务器获取地图数据
 * @param {string} mapType - 地图类型，例如 'satellite', 'road'
 * @returns {Promise<Object>} 包含地图数据的 Promise 对象
 */
function fetchMapData(mapType) {
    return new Promise((resolve, reject) => {
        // 模拟网络请求延迟
        setTimeout(() => {
            if (mapType) {
                resolve({
                    type: mapType,
                    data: `这是 ${mapType} 类型的地图数据`,
                    timestamp: new Date().toISOString()
                });
            } else {
                reject(new Error('未指定地图类型'));
            }
        }, 1000);
    });
}

/**
 * 计算两个经纬度点之间的距离（单位：千米）
 * 使用 Haversine 公式
 * @param {number} lat1 - 第一个点的纬度
 * @param {number} lon1 - 第一个点的经度
 * @param {number} lat2 - 第二个点的纬度
 * @param {number} lon2 - 第二个点的经度
 * @returns {number} 两点之间的距离（千米）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径，单位：千米
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * 将角度转换为弧度
 * @param {number} deg - 角度值
 * @returns {number} 弧度值
 */
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// 导出函数以便其他模块使用
export { fetchMapData, calculateDistance };
