-- Manyplay Black Market - CREATOR SERVER
-- Menu admin CRUD marchés, items, stocks, whitelist

local ESX = exports['es_extended']:getSharedObject()

-- Vérifie si le joueur est admin (adapte selon ton système staff si besoin)
local function isAdmin(src)
    local xPlayer = ESX.GetPlayerFromId(src)
    if not xPlayer then return false end
    local group = xPlayer.getGroup and xPlayer.getGroup() or (xPlayer.getGroup and xPlayer:getGroup())
    return group == "admin" or group == "superadmin"
end

-- OUVERTURE UI CREATOR
RegisterCommand("bm_creator", function(src)
    if not isAdmin(src) then
        TriggerClientEvent('ox_lib:notify', src, {description = "Accès réservé staff/admin", type = "error"})
        return
    end
    TriggerClientEvent("manyplay_bm_creator:openui", src)
end)

-- API: Récupère la config complète pour l'UI (marchés, items, stocks, grades)
lib.callback.register('manyplay_bm_creator:getConfig', function(src)
    if not isAdmin(src) then return nil end
    return {
        markets = Config.BlackMarkets,
        grades = Config.GangGrades,
        whitelists = Config.SpecialWhitelists
    }
end)

-- API: Sauvegarde des modifications (live) sur un marché ou item
RegisterNetEvent('manyplay_bm_creator:updateMarket', function(marketId, newData)
    local src = source
    if not isAdmin(src) then return end
    -- On modifie directement la config en mémoire
    Config.BlackMarkets[marketId] = newData
    -- (Optionnel: log Discord)
    TriggerClientEvent('ox_lib:notify', src, {description = "PNJ mis à jour !", type = "success"})
end)

RegisterNetEvent('manyplay_bm_creator:addMarket', function(marketId, data)
    local src = source
    if not isAdmin(src) then return end
    Config.BlackMarkets[marketId] = data
    TriggerClientEvent('ox_lib:notify', src, {description = "Nouveau PNJ ajouté !", type = "success"})
end)

RegisterNetEvent('manyplay_bm_creator:removeMarket', function(marketId)
    local src = source
    if not isAdmin(src) then return end
    Config.BlackMarkets[marketId] = nil
    TriggerClientEvent('ox_lib:notify', src, {description = "PNJ supprimé !", type = "success"})
end)

RegisterNetEvent('manyplay_bm_creator:updateWhitelist', function(marketId, wl)
    local src = source
    if not isAdmin(src) then return end
    Config.SpecialWhitelists[marketId] = wl
    TriggerClientEvent('ox_lib:notify', src, {description = "Whitelist mise à jour !", type = "success"})
end)

-- TODO : Ajouter persistance (écriture dans config.lua ou en base) selon besoin